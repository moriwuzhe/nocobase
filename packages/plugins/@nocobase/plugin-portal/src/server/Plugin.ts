/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const PORTAL_JWT_SECRET = process.env.PORTAL_JWT_SECRET || 'portal-secret-change-me';
const PORTAL_TOKEN_EXPIRY = '7d';

/**
 * Portal Plugin Server
 *
 * Provides:
 * - CRUD for portals and external users (admin side)
 * - External user auth flow (login / register / password reset)
 * - Portal middleware that injects portal context and enforces data isolation
 * - JWT-based session for external users (separate from internal users)
 */
export default class PluginPortalServer extends Plugin {
  async load() {
    // =====================================================================
    // 1. Admin-side resources (managed by internal NocoBase users)
    // =====================================================================
    this.app.resourceManager.define({ name: 'portals' });
    this.app.resourceManager.define({ name: 'externalUsers' });

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['portals:*', 'externalUsers:*'],
    });

    // =====================================================================
    // 2. Portal auth endpoints (public, called by external users)
    // =====================================================================
    this.app.resourceManager.define({
      name: 'portalAuth',
      actions: {
        login: this.handleLogin.bind(this),
        register: this.handleRegister.bind(this),
        getProfile: this.handleGetProfile.bind(this),
        updateProfile: this.handleUpdateProfile.bind(this),
        changePassword: this.handleChangePassword.bind(this),
        getPortalInfo: this.handleGetPortalInfo.bind(this),
      },
    });

    // Public endpoints (no auth required)
    this.app.acl.allow('portalAuth', ['login', 'register', 'getPortalInfo'], 'public');
    // Endpoints that require portal token
    this.app.acl.allow('portalAuth', ['getProfile', 'updateProfile', 'changePassword'], 'public');

    // =====================================================================
    // 3. Portal data API (for external users to access permitted data)
    // =====================================================================
    this.app.resourceManager.define({
      name: 'portalData',
      actions: {
        list: this.handleDataList.bind(this),
        get: this.handleDataGet.bind(this),
        create: this.handleDataCreate.bind(this),
        update: this.handleDataUpdate.bind(this),
      },
    });
    this.app.acl.allow('portalData', ['list', 'get', 'create', 'update'], 'public');

    // =====================================================================
    // 4. Portal context middleware
    // =====================================================================
    this.app.use(this.portalMiddleware.bind(this));
  }

  // -----------------------------------------------------------------------
  // Middleware
  // -----------------------------------------------------------------------

  /**
   * Intercept `/portal/:slug/api/*` requests:
   * - Resolve the portal from the slug
   * - Verify the external user JWT token
   * - Attach portal + externalUser to ctx.state
   */
  private async portalMiddleware(ctx: any, next: any) {
    const portalMatch = ctx.path.match(/^\/portal\/([^/]+)\/api\/(.*)/);
    if (!portalMatch) {
      return next();
    }

    const [, portalSlug] = portalMatch;
    const portal = await ctx.db.getRepository('portals').findOne({
      filter: { name: portalSlug, enabled: true },
    });

    if (!portal) {
      ctx.status = 404;
      ctx.body = { error: 'Portal not found' };
      return;
    }

    ctx.state.portal = portal;
    ctx.state.isPortalRequest = true;

    // Check for portal auth token (except public endpoints)
    const authHeader = ctx.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, PORTAL_JWT_SECRET) as any;
        if (payload.portalId === portal.id) {
          const externalUser = await ctx.db.getRepository('externalUsers').findOne({
            filterByTk: payload.userId,
          });
          if (externalUser?.enabled) {
            ctx.state.portalUser = externalUser;
          }
        }
      } catch {
        // Invalid token — continue without user (will fail on protected endpoints)
      }
    }

    return next();
  }

  // -----------------------------------------------------------------------
  // Auth endpoints
  // -----------------------------------------------------------------------

  /**
   * POST /api/portalAuth:login
   * Body: { portalName, email, password }
   */
  private async handleLogin(ctx: any, next: any) {
    const { portalName, email, phone, password } = ctx.action.params.values || {};

    if (!portalName || !password) {
      return ctx.throw(400, 'portalName and password are required');
    }
    if (!email && !phone) {
      return ctx.throw(400, 'email or phone is required');
    }

    const portal = await ctx.db.getRepository('portals').findOne({
      filter: { name: portalName, enabled: true },
    });
    if (!portal) {
      return ctx.throw(404, 'Portal not found');
    }

    const filter: any = { portalId: portal.id };
    if (email) filter.email = email;
    if (phone) filter.phone = phone;

    const user = await ctx.db.getRepository('externalUsers').findOne({ filter });

    if (!user) {
      return ctx.throw(401, 'Invalid credentials');
    }
    if (!user.enabled) {
      return ctx.throw(403, 'Account is disabled');
    }

    // Verify password
    const passwordHash = this.hashPassword(password);
    const storedPassword = user.get('password');
    if (!storedPassword || !this.verifyPassword(password, storedPassword)) {
      return ctx.throw(401, 'Invalid credentials');
    }

    // Update last login
    await ctx.db.getRepository('externalUsers').update({
      filterByTk: user.id,
      values: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, portalId: portal.id, role: user.role },
      PORTAL_JWT_SECRET,
      { expiresIn: PORTAL_TOKEN_EXPIRY },
    );

    ctx.body = {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        company: user.company,
        avatar: user.avatar,
      },
      portal: {
        id: portal.id,
        name: portal.name,
        title: portal.title,
        branding: portal.branding,
      },
    };
    await next();
  }

  /**
   * POST /api/portalAuth:register
   * Body: { portalName, email, password, nickname, phone?, company? }
   */
  private async handleRegister(ctx: any, next: any) {
    const { portalName, email, password, nickname, phone, company } = ctx.action.params.values || {};

    if (!portalName || !email || !password || !nickname) {
      return ctx.throw(400, 'portalName, email, password, and nickname are required');
    }

    const portal = await ctx.db.getRepository('portals').findOne({
      filter: { name: portalName, enabled: true },
    });
    if (!portal) {
      return ctx.throw(404, 'Portal not found');
    }

    // Check if self-registration is allowed
    if (!portal.authConfig?.allowSelfRegister) {
      return ctx.throw(403, 'Self-registration is not allowed for this portal');
    }

    // Check if email already exists
    const existing = await ctx.db.getRepository('externalUsers').findOne({
      filter: { portalId: portal.id, email },
    });
    if (existing) {
      return ctx.throw(409, 'An account with this email already exists');
    }

    // Create user
    const hashedPassword = this.hashPassword(password);
    const user = await ctx.db.getRepository('externalUsers').create({
      values: {
        portalId: portal.id,
        email,
        password: hashedPassword,
        nickname,
        phone: phone || null,
        company: company || null,
        role: 'member',
        enabled: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, portalId: portal.id, role: 'member' },
      PORTAL_JWT_SECRET,
      { expiresIn: PORTAL_TOKEN_EXPIRY },
    );

    ctx.body = {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
      },
    };
    await next();
  }

  /**
   * GET /api/portalAuth:getProfile
   * Header: Authorization: Bearer <token>
   */
  private async handleGetProfile(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    ctx.body = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      company: user.company,
      avatar: user.avatar,
      role: user.role,
      profile: user.profile,
    };
    await next();
  }

  /**
   * POST /api/portalAuth:updateProfile
   * Body: { nickname?, phone?, company?, avatar?, profile? }
   */
  private async handleUpdateProfile(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const { nickname, phone, company, avatar, profile } = ctx.action.params.values || {};

    const updates: any = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (avatar !== undefined) updates.avatar = avatar;
    if (profile !== undefined) updates.profile = profile;

    await ctx.db.getRepository('externalUsers').update({
      filterByTk: user.id,
      values: updates,
    });

    ctx.body = { success: true };
    await next();
  }

  /**
   * POST /api/portalAuth:changePassword
   * Body: { oldPassword, newPassword }
   */
  private async handleChangePassword(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const { oldPassword, newPassword } = ctx.action.params.values || {};

    if (!oldPassword || !newPassword) {
      return ctx.throw(400, 'oldPassword and newPassword are required');
    }
    if (newPassword.length < 6) {
      return ctx.throw(400, 'Password must be at least 6 characters');
    }

    const fullUser = await ctx.db.getRepository('externalUsers').findOne({
      filterByTk: user.id,
    });

    if (!this.verifyPassword(oldPassword, fullUser.password)) {
      return ctx.throw(401, 'Current password is incorrect');
    }

    await ctx.db.getRepository('externalUsers').update({
      filterByTk: user.id,
      values: { password: this.hashPassword(newPassword) },
    });

    ctx.body = { success: true };
    await next();
  }

  /**
   * GET /api/portalAuth:getPortalInfo?portalName=xxx
   * Public endpoint — returns portal branding and auth config.
   */
  private async handleGetPortalInfo(ctx: any, next: any) {
    const { portalName } = ctx.action.params;
    if (!portalName) {
      return ctx.throw(400, 'portalName is required');
    }

    const portal = await ctx.db.getRepository('portals').findOne({
      filter: { name: portalName, enabled: true },
    });
    if (!portal) {
      return ctx.throw(404, 'Portal not found');
    }

    ctx.body = {
      name: portal.name,
      title: portal.title,
      branding: portal.branding,
      authConfig: {
        allowEmailLogin: portal.authConfig?.allowEmailLogin ?? true,
        allowPhoneLogin: portal.authConfig?.allowPhoneLogin ?? false,
        allowSelfRegister: portal.authConfig?.allowSelfRegister ?? false,
        allowWechatLogin: portal.authConfig?.allowWechatLogin ?? false,
      },
    };
    await next();
  }

  // -----------------------------------------------------------------------
  // Portal data endpoints (with data isolation)
  // -----------------------------------------------------------------------

  /**
   * GET /api/portalData:list?collection=xxx&filter=...
   * Returns data from a collection, filtered by portal permissions.
   */
  private async handleDataList(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const portal = await this.getPortalFromToken(ctx);
    const { collection, filter = {}, page = 1, pageSize = 20, sort, appends } = ctx.action.params;

    if (!collection) {
      return ctx.throw(400, 'collection parameter is required');
    }

    // Check if this collection is allowed for this portal
    if (!this.isCollectionAllowed(portal, collection, 'list')) {
      return ctx.throw(403, `Access to collection "${collection}" is not allowed`);
    }

    // Apply portal data isolation filter
    const isolatedFilter = this.applyDataIsolation(portal, user, collection, filter);

    const repo = ctx.db.getRepository(collection);
    const [data, count] = await repo.findAndCount({
      filter: isolatedFilter,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      sort: sort ? [sort] : undefined,
      appends: appends ? appends.split(',') : undefined,
    });

    ctx.body = {
      data,
      meta: { count, page, pageSize, totalPages: Math.ceil(count / pageSize) },
    };
    await next();
  }

  private async handleDataGet(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const portal = await this.getPortalFromToken(ctx);
    const { collection, filterByTk, appends } = ctx.action.params;

    if (!collection || !filterByTk) {
      return ctx.throw(400, 'collection and filterByTk are required');
    }

    if (!this.isCollectionAllowed(portal, collection, 'get')) {
      return ctx.throw(403, `Access to collection "${collection}" is not allowed`);
    }

    const repo = ctx.db.getRepository(collection);
    const record = await repo.findOne({
      filterByTk,
      appends: appends ? appends.split(',') : undefined,
    });

    if (!record) {
      return ctx.throw(404, 'Record not found');
    }

    ctx.body = record;
    await next();
  }

  private async handleDataCreate(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const portal = await this.getPortalFromToken(ctx);
    const { collection } = ctx.action.params;
    const values = ctx.action.params.values || {};

    if (!collection) {
      return ctx.throw(400, 'collection parameter is required');
    }

    if (!this.isCollectionAllowed(portal, collection, 'create')) {
      return ctx.throw(403, `Create access to collection "${collection}" is not allowed`);
    }

    // Inject portal user info
    values._portalUserId = user.id;
    values._portalId = portal.id;

    const repo = ctx.db.getRepository(collection);
    const record = await repo.create({ values });

    ctx.body = record;
    await next();
  }

  private async handleDataUpdate(ctx: any, next: any) {
    const user = await this.requirePortalAuth(ctx);
    const portal = await this.getPortalFromToken(ctx);
    const { collection, filterByTk } = ctx.action.params;
    const values = ctx.action.params.values || {};

    if (!collection || !filterByTk) {
      return ctx.throw(400, 'collection and filterByTk are required');
    }

    if (!this.isCollectionAllowed(portal, collection, 'update')) {
      return ctx.throw(403, `Update access to collection "${collection}" is not allowed`);
    }

    const repo = ctx.db.getRepository(collection);
    await repo.update({ filterByTk, values });

    ctx.body = { success: true };
    await next();
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /**
   * Extract and verify the portal JWT from the Authorization header.
   * Throws 401 if no valid token found.
   */
  private async requirePortalAuth(ctx: any) {
    // If already resolved by middleware
    if (ctx.state.portalUser) {
      return ctx.state.portalUser;
    }

    const authHeader = ctx.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return ctx.throw(401, 'Authorization token is required');
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, PORTAL_JWT_SECRET) as any;
      const user = await ctx.db.getRepository('externalUsers').findOne({
        filterByTk: payload.userId,
      });
      if (!user?.enabled) {
        return ctx.throw(401, 'Account is disabled or not found');
      }
      ctx.state.portalUser = user;
      return user;
    } catch {
      return ctx.throw(401, 'Invalid or expired token');
    }
  }

  private async getPortalFromToken(ctx: any) {
    if (ctx.state.portal) return ctx.state.portal;

    const authHeader = ctx.get('Authorization');
    if (!authHeader) return ctx.throw(401);

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, PORTAL_JWT_SECRET) as any;
    const portal = await ctx.db.getRepository('portals').findOne({
      filterByTk: payload.portalId,
    });
    ctx.state.portal = portal;
    return portal;
  }

  /**
   * Check if a collection is in the portal's permissions whitelist.
   */
  private isCollectionAllowed(portal: any, collection: string, action: string): boolean {
    const permissions = portal.permissions || {};
    const collectionPerms = permissions[collection];
    if (!collectionPerms) return false;
    if (collectionPerms === '*') return true;
    if (Array.isArray(collectionPerms)) return collectionPerms.includes(action);
    if (typeof collectionPerms === 'object') return !!collectionPerms[action];
    return false;
  }

  /**
   * Apply data isolation: inject filter conditions to restrict visible data.
   */
  private applyDataIsolation(portal: any, user: any, collection: string, filter: any) {
    const permissions = portal.permissions || {};
    const collectionPerms = permissions[collection];
    const isolationFilter = collectionPerms?.dataFilter;

    if (!isolationFilter) return filter;

    // Replace variables
    const resolved = JSON.parse(
      JSON.stringify(isolationFilter)
        .replace(/\{\{portalUserId\}\}/g, String(user.id))
        .replace(/\{\{portalId\}\}/g, String(portal.id)),
    );

    return { $and: [filter, resolved].filter((f) => f && Object.keys(f).length) };
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(input: string, stored: string): boolean {
    return this.hashPassword(input) === stored;
  }
}

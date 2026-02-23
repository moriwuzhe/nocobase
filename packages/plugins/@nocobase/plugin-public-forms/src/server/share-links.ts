/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Share Links API
 *
 * Like MingDaoYun's external sharing, generates public links
 * to share specific records or views with external users.
 *
 * Features:
 * - Generate unique share tokens
 * - Expiry date support
 * - Password protection
 * - View/edit permissions
 * - Access count tracking
 * - Revoke access
 */

import * as crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function registerShareLinksActions(app: any) {
  app.resourceManager.define({
    name: 'shareLinks',
    actions: {
      /**
       * POST /api/shareLinks:create
       * Body: { collectionName, recordId?, viewType?, fields?, expiresAt?, password?, permission? }
       */
      async create(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);

        const { collectionName, recordId, viewType, fields, expiresAt, password, permission } = ctx.action.params.values || {};
        if (!collectionName) return ctx.throw(400, 'collectionName required');

        const repo = ctx.db.getRepository('shareLinks');
        if (!repo) return ctx.throw(500, 'shareLinks collection not available');

        const token = generateToken();
        const hashedPassword = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

        const link = await repo.create({
          values: {
            token,
            collectionName,
            recordId: recordId ? String(recordId) : null,
            viewType: viewType || 'detail',
            fields: fields || [],
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            password: hashedPassword,
            permission: permission || 'view',
            createdById: userId,
            accessCount: 0,
            enabled: true,
          },
        });

        ctx.body = {
          id: link.id,
          token,
          url: `/share/${token}`,
          expiresAt: expiresAt || null,
          hasPassword: !!password,
        };
        await next();
      },

      /**
       * GET /api/shareLinks:access?token=xxx&password?=xxx
       * Public access to shared data.
       */
      async access(ctx: any, next: any) {
        const { token, password } = ctx.action.params;
        if (!token) return ctx.throw(400, 'token required');

        const repo = ctx.db.getRepository('shareLinks');
        if (!repo) return ctx.throw(500);

        const link = await repo.findOne({ filter: { token, enabled: true } });
        if (!link) return ctx.throw(404, 'Share link not found or expired');

        const linkData = link.toJSON ? link.toJSON() : link;

        // Check expiry
        if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
          return ctx.throw(410, 'Share link has expired');
        }

        // Check password
        if (linkData.password) {
          const hashedInput = password ? crypto.createHash('sha256').update(password).digest('hex') : '';
          if (hashedInput !== linkData.password) {
            return ctx.throw(403, 'Password required or incorrect');
          }
        }

        // Increment access count
        await repo.update({ filterByTk: link.id, values: { accessCount: (linkData.accessCount || 0) + 1, lastAccessedAt: new Date() } });

        // Fetch data
        if (linkData.recordId) {
          const record = await ctx.db.getRepository(linkData.collectionName).findOne({ filterByTk: linkData.recordId });
          if (!record) return ctx.throw(404, 'Record not found');

          const data = record.toJSON ? record.toJSON() : record;
          const filteredData = linkData.fields?.length
            ? Object.fromEntries(Object.entries(data).filter(([k]) => linkData.fields.includes(k) || k === 'id'))
            : data;

          ctx.body = { type: 'record', collection: linkData.collectionName, data: filteredData };
        } else {
          const records = await ctx.db.getRepository(linkData.collectionName).find({ limit: 100, sort: ['-createdAt'] });
          const data = records.map((r: any) => {
            const d = r.toJSON ? r.toJSON() : r;
            return linkData.fields?.length
              ? Object.fromEntries(Object.entries(d).filter(([k]) => linkData.fields.includes(k) || k === 'id'))
              : d;
          });
          ctx.body = { type: 'list', collection: linkData.collectionName, data, total: data.length };
        }
        await next();
      },

      /**
       * GET /api/shareLinks:listMine
       */
      async listMine(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);

        const repo = ctx.db.getRepository('shareLinks');
        if (!repo) { ctx.body = []; return next(); }

        ctx.body = await repo.find({
          filter: { createdById: userId },
          sort: ['-createdAt'],
        });
        await next();
      },

      /**
       * POST /api/shareLinks:revoke
       * Body: { id }
       */
      async revoke(ctx: any, next: any) {
        const { filterByTk } = ctx.action.params;
        const userId = ctx.state.currentUser?.id;

        const repo = ctx.db.getRepository('shareLinks');
        if (!repo) return ctx.throw(500);

        await repo.update({
          filter: { id: filterByTk, createdById: userId },
          values: { enabled: false },
        });
        ctx.body = { success: true };
        await next();
      },
    },
  });

  app.acl.allow('shareLinks', ['access'], 'public');
  app.acl.allow('shareLinks', ['create', 'listMine', 'revoke'], 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.share-links',
    actions: ['shareLinks:*'],
  });
}

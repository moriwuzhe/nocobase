/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * Portal Plugin - External-facing portals for customers, suppliers, partners.
 *
 * Features:
 * - Multiple portals with independent URLs
 * - External user registration and authentication
 * - Custom branding (logo, colors, CSS)
 * - Data isolation: external users only see what's permitted
 * - Portal-specific page designer (reuses NocoBase block system)
 * - Custom domain support
 */
export default class PluginPortalServer extends Plugin {
  async load() {
    // --- Resource definitions ---
    this.app.resourceManager.define({
      name: 'portals',
    });

    this.app.resourceManager.define({
      name: 'externalUsers',
    });

    // --- Portal access middleware ---
    // Intercept requests with portal path prefix and apply portal context
    this.app.use(async (ctx, next) => {
      const portalMatch = ctx.path.match(/^\/portal\/([^/]+)(.*)/);
      if (portalMatch) {
        const portalSlug = portalMatch[1];
        const portal = await ctx.db.getRepository('portals').findOne({
          filter: { name: portalSlug, enabled: true },
        });

        if (!portal) {
          ctx.status = 404;
          ctx.body = { error: 'Portal not found' };
          return;
        }

        // Attach portal context for downstream handlers
        ctx.state.portal = portal;
        ctx.state.isPortalRequest = true;
      }

      await next();
    });

    // --- ACL ---
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['portals:*', 'externalUsers:*'],
    });

    // Portal public endpoints (no auth needed for login/register)
    this.app.acl.allow('portals', ['get'], 'public');
  }
}

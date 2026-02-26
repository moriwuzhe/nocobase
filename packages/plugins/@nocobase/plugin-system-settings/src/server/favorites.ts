/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * User Favorites API
 *
 * Allows users to bookmark pages, records, and reports
 * for quick access from the sidebar or homepage.
 */

export function registerFavoritesActions(app: any) {
  app.resourceManager.define({
    name: 'userFavorites',
    actions: {
      async listMine(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);
        const repo = ctx.db.getRepository('userFavorites');
        if (!repo) { ctx.body = []; return next(); }
        ctx.body = await repo.find({
          filter: { userId },
          sort: ['sort', '-createdAt'],
        });
        await next();
      },

      async add(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);
        const { type, title, collectionName, recordId, url, icon } = ctx.action.params.values || {};
        if (!title) return ctx.throw(400, 'title is required');

        const repo = ctx.db.getRepository('userFavorites');
        if (!repo) return ctx.throw(500);

        const existing = await repo.findOne({
          filter: { userId, type, collectionName, recordId, url },
        });
        if (existing) {
          ctx.body = { success: true, action: 'exists', id: existing.id };
          return next();
        }

        const result = await repo.create({
          values: { userId, type: type || 'page', title, collectionName, recordId, url, icon },
        });
        ctx.body = { success: true, action: 'created', id: result.id };
        await next();
      },

      async remove(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);
        const { filterByTk } = ctx.action.params;
        const repo = ctx.db.getRepository('userFavorites');
        if (!repo) return ctx.throw(500);
        await repo.destroy({ filter: { id: filterByTk, userId } });
        ctx.body = { success: true };
        await next();
      },

      async reorder(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);
        const { ids } = ctx.action.params.values || {};
        if (!ids?.length) return ctx.throw(400);
        const repo = ctx.db.getRepository('userFavorites');
        if (!repo) return ctx.throw(500);
        for (let i = 0; i < ids.length; i++) {
          await repo.update({ filter: { id: ids[i], userId }, values: { sort: i } });
        }
        ctx.body = { success: true };
        await next();
      },
    },
  });

  app.acl.allow('userFavorites', ['listMine', 'add', 'remove', 'reorder'], 'loggedIn');
}

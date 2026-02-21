/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Recycle Bin / Trash Service
 *
 * Captures deleted records and allows restoration.
 * Works by hooking into the database `beforeDestroy` event
 * to snapshot the record data before it's permanently deleted.
 *
 * Features:
 * - Automatic capture of all deleted records from logged collections
 * - Browse deleted records by collection
 * - Restore individual or batch records
 * - Auto-purge after configurable retention period
 * - Track who deleted what and when
 */

import { Database } from '@nocobase/database';

const RETENTION_DAYS = 90;

export function registerRecycleBinHooks(db: Database) {
  db.on('beforeDestroy', async (model: any, options: any) => {
    const { collection } = model.constructor;
    if (!collection || !collection.options.logging) return;

    try {
      const data = model.toJSON ? model.toJSON() : { ...model.dataValues };
      const userId = options?.context?.state?.currentUser?.id;
      const collectionName = collection.name;
      const recordId = model.get(model.constructor.primaryKeyAttribute);

      const recycleBinRepo = db.getRepository('recycleBin');
      if (!recycleBinRepo) return;

      await recycleBinRepo.create({
        values: {
          collectionName,
          recordId: String(recordId),
          data: JSON.stringify(data),
          deletedById: userId || null,
          deletedAt: new Date(),
        },
        hooks: false,
        transaction: options.transaction,
      });
    } catch {
      // non-critical, don't block the delete
    }
  });
}

export function registerRecycleBinActions(app: any) {
  app.resourceManager.define({
    name: 'recycleBin',
    actions: {
      /**
       * GET /api/recycleBin:list
       * Params: { collectionName?, page?, pageSize? }
       */
      async list(ctx: any, next: any) {
        const { collectionName, page = 1, pageSize = 20 } = ctx.action.params;
        const filter: any = {};
        if (collectionName) filter.collectionName = collectionName;

        const repo = ctx.db.getRepository('recycleBin');
        const [data, total] = await Promise.all([
          repo.find({
            filter,
            sort: ['-deletedAt'],
            offset: (page - 1) * pageSize,
            limit: pageSize,
            appends: ['deletedBy'],
          }),
          repo.count({ filter }),
        ]);

        ctx.body = {
          data: data.map((item: any) => {
            const json = item.toJSON ? item.toJSON() : item;
            try { json.data = JSON.parse(json.data); } catch { /* keep as string */ }
            return json;
          }),
          meta: { count: total, page, pageSize },
        };
        await next();
      },

      /**
       * POST /api/recycleBin:restore
       * Body: { id } or { ids: number[] }
       *
       * Restores deleted record(s) back to their original collection.
       */
      async restore(ctx: any, next: any) {
        const { id, ids } = ctx.action.params.values || ctx.action.params;
        const targetIds = ids || (id ? [id] : []);

        if (targetIds.length === 0) return ctx.throw(400, 'id or ids is required');

        const repo = ctx.db.getRepository('recycleBin');
        const items = await repo.find({ filter: { id: { $in: targetIds } } });

        let restored = 0;
        const errors: string[] = [];

        for (const item of items) {
          try {
            const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            const targetRepo = ctx.db.getRepository(item.collectionName);
            if (!targetRepo) {
              errors.push(`Collection "${item.collectionName}" not found`);
              continue;
            }

            const { id: _id, createdAt, updatedAt, ...restoreData } = data;

            await targetRepo.create({ values: restoreData });
            await repo.destroy({ filterByTk: item.id });
            restored++;
          } catch (err: any) {
            errors.push(`#${item.id}: ${err.message}`);
          }
        }

        ctx.body = {
          success: true,
          restored,
          total: targetIds.length,
          errors: errors.length > 0 ? errors : undefined,
        };
        await next();
      },

      /**
       * POST /api/recycleBin:purge
       * Body: { collectionName?, olderThanDays? }
       *
       * Permanently deletes items from the recycle bin.
       */
      async purge(ctx: any, next: any) {
        const { collectionName, olderThanDays = RETENTION_DAYS } = ctx.action.params.values || {};
        const filter: any = {};
        if (collectionName) filter.collectionName = collectionName;

        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        filter.deletedAt = { $lt: cutoff };

        const repo = ctx.db.getRepository('recycleBin');
        const count = await repo.count({ filter });
        await repo.destroy({ filter });

        ctx.body = { success: true, purged: count };
        await next();
      },

      /**
       * GET /api/recycleBin:stats
       * Returns count of deleted items grouped by collection.
       */
      async stats(ctx: any, next: any) {
        const repo = ctx.db.getRepository('recycleBin');
        const items = await repo.find({ fields: ['collectionName'] });

        const byCollection: Record<string, number> = {};
        items.forEach((item: any) => {
          const name = item.collectionName || 'unknown';
          byCollection[name] = (byCollection[name] || 0) + 1;
        });

        const total = items.length;
        ctx.body = { total, byCollection };
        await next();
      },
    },
  });

  app.acl.registerSnippet({
    name: 'pm.audit-logs.recycle-bin',
    actions: ['recycleBin:*'],
  });
  app.acl.allow('recycleBin', ['list', 'stats'], 'loggedIn');
}

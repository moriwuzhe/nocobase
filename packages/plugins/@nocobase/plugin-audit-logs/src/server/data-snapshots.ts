/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Snapshots / Version Management
 *
 * Like MingDaoYun's record version history, automatically saves
 * snapshots of records before they are modified.
 * Allows viewing and restoring previous versions.
 */

import { Database } from '@nocobase/database';

export function registerSnapshotHooks(db: Database) {
  db.on('beforeUpdate', async (model: any, options: any) => {
    const { collection } = model.constructor;
    if (!collection || !collection.options.logging) return;

    try {
      const snapshotRepo = db.getRepository('dataSnapshots');
      if (!snapshotRepo) return;

      const data = model.previous() || {};
      const recordId = model.get(model.constructor.primaryKeyAttribute);
      if (!recordId) return;

      const userId = options?.context?.state?.currentUser?.id;

      await snapshotRepo.create({
        values: {
          collectionName: collection.name,
          recordId: String(recordId),
          version: Date.now(),
          data: JSON.stringify(data),
          userId: userId || null,
        },
        hooks: false,
        transaction: options.transaction,
      });
    } catch { /* non-critical */ }
  });
}

export function registerSnapshotActions(app: any) {
  app.resourceManager.define({
    name: 'dataSnapshots',
    actions: {
      /**
       * GET /api/dataSnapshots:list?collectionName=xxx&recordId=xxx
       */
      async list(ctx: any, next: any) {
        const { collectionName, recordId, limit = 20 } = ctx.action.params;
        if (!collectionName || !recordId) return ctx.throw(400);

        const repo = ctx.db.getRepository('dataSnapshots');
        if (!repo) { ctx.body = []; return next(); }

        const snapshots = await repo.find({
          filter: { collectionName, recordId: String(recordId) },
          sort: ['-version'],
          limit: Math.min(parseInt(String(limit)) || 20, 100),
          appends: ['user'],
        });

        ctx.body = snapshots.map((s: any) => {
          const d = s.toJSON ? s.toJSON() : s;
          try { d.data = JSON.parse(d.data); } catch { /* keep as string */ }
          return d;
        });
        await next();
      },

      /**
       * POST /api/dataSnapshots:restore
       * Body: { snapshotId }
       */
      async restore(ctx: any, next: any) {
        const { snapshotId } = ctx.action.params.values || {};
        if (!snapshotId) return ctx.throw(400, 'snapshotId required');

        const repo = ctx.db.getRepository('dataSnapshots');
        if (!repo) return ctx.throw(500);

        const snapshot = await repo.findOne({ filterByTk: snapshotId });
        if (!snapshot) return ctx.throw(404);

        const snapshotData = snapshot.toJSON ? snapshot.toJSON() : snapshot;
        let data;
        try { data = typeof snapshotData.data === 'string' ? JSON.parse(snapshotData.data) : snapshotData.data; } catch { return ctx.throw(400, 'Invalid snapshot data'); }

        const targetRepo = ctx.db.getRepository(snapshotData.collectionName);
        if (!targetRepo) return ctx.throw(404);

        const { id, createdAt, updatedAt, createdById, updatedById, ...restoreData } = data;

        await targetRepo.update({
          filterByTk: snapshotData.recordId,
          values: restoreData,
        });

        ctx.body = { success: true, restoredFrom: snapshotData.version };
        await next();
      },

      /**
       * POST /api/dataSnapshots:compare
       * Body: { snapshotId1, snapshotId2 }
       */
      async compare(ctx: any, next: any) {
        const { snapshotId1, snapshotId2 } = ctx.action.params.values || {};
        if (!snapshotId1 || !snapshotId2) return ctx.throw(400);

        const repo = ctx.db.getRepository('dataSnapshots');
        if (!repo) return ctx.throw(500);

        const [s1, s2] = await Promise.all([
          repo.findOne({ filterByTk: snapshotId1 }),
          repo.findOne({ filterByTk: snapshotId2 }),
        ]);
        if (!s1 || !s2) return ctx.throw(404);

        const d1 = typeof s1.data === 'string' ? JSON.parse(s1.data) : s1.data;
        const d2 = typeof s2.data === 'string' ? JSON.parse(s2.data) : s2.data;

        const diff: Record<string, { old: any; new: any }> = {};
        const allKeys = new Set([...Object.keys(d1), ...Object.keys(d2)]);
        for (const key of allKeys) {
          if (JSON.stringify(d1[key]) !== JSON.stringify(d2[key])) {
            diff[key] = { old: d1[key], new: d2[key] };
          }
        }

        ctx.body = { diff, version1: s1.version, version2: s2.version };
        await next();
      },
    },
  });

  app.acl.allow('dataSnapshots', ['list'], 'loggedIn');
  app.acl.registerSnippet({ name: 'pm.audit-logs.snapshots', actions: ['dataSnapshots:*'] });
}

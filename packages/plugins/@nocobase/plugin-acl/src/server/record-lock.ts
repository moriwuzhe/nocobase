/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Record Lock System
 *
 * Allows locking individual records to prevent modification/deletion.
 * Similar to MingDaoYun's record protection feature.
 *
 * - Admin can lock/unlock any record
 * - Locked records cannot be updated or deleted (returns 423 Locked)
 * - Lock info includes who locked it and when
 * - Supports auto-lock rules (e.g., lock when status = 'approved')
 */

export function registerRecordLockMiddleware(app: any) {
  // Middleware: block updates/deletes on locked records
  app.resourcer.use(async (ctx: any, next: any) => {
    const { actionName, resourceName } = ctx.action || {};
    if (!['update', 'destroy'].includes(actionName)) { await next(); return; }

    const filterByTk = ctx.action.params.filterByTk;
    if (!filterByTk) { await next(); return; }

    try {
      const lockRepo = ctx.db.getRepository('recordLocks');
      if (!lockRepo) { await next(); return; }

      const lock = await lockRepo.findOne({
        filter: { collectionName: resourceName, recordId: String(filterByTk), locked: true },
      });

      if (lock) {
        const currentRole = ctx.state?.currentRole;
        if (currentRole !== 'root') {
          ctx.throw(423, `记录已锁定，无法${actionName === 'update' ? '修改' : '删除'}。锁定人: ${lock.lockedByName || 'Admin'}`);
          return;
        }
      }
    } catch (e: any) {
      if (e.status === 423) throw e;
      // Lock collection may not exist, continue normally
    }

    await next();
  }, { group: 'record-lock', after: 'acl' });

  // API for managing locks
  app.resourceManager.define({
    name: 'recordLocks',
    actions: {
      async lock(ctx: any, next: any) {
        const { collectionName, recordId, reason } = ctx.action.params.values || {};
        if (!collectionName || !recordId) return ctx.throw(400, 'collectionName and recordId required');

        const repo = ctx.db.getRepository('recordLocks');
        if (!repo) return ctx.throw(500);

        const userId = ctx.state.currentUser?.id;
        const nickname = ctx.state.currentUser?.nickname || `User #${userId}`;

        await repo.updateOrCreate({
          filterKeys: ['collectionName', 'recordId'],
          values: {
            collectionName, recordId: String(recordId), locked: true,
            lockedById: userId, lockedByName: nickname, lockedAt: new Date(), reason,
          },
        });
        ctx.body = { success: true, message: '记录已锁定' };
        await next();
      },

      async unlock(ctx: any, next: any) {
        const { collectionName, recordId } = ctx.action.params.values || {};
        if (!collectionName || !recordId) return ctx.throw(400);

        const repo = ctx.db.getRepository('recordLocks');
        if (!repo) return ctx.throw(500);

        await repo.update({
          filter: { collectionName, recordId: String(recordId) },
          values: { locked: false, unlockedAt: new Date(), unlockedById: ctx.state.currentUser?.id },
        });
        ctx.body = { success: true, message: '记录已解锁' };
        await next();
      },

      async check(ctx: any, next: any) {
        const { collectionName, recordId } = ctx.action.params;
        if (!collectionName || !recordId) return ctx.throw(400);

        const repo = ctx.db.getRepository('recordLocks');
        if (!repo) { ctx.body = { locked: false }; return next(); }

        const lock = await repo.findOne({
          filter: { collectionName, recordId: String(recordId), locked: true },
        });
        ctx.body = lock
          ? { locked: true, lockedBy: lock.lockedByName, lockedAt: lock.lockedAt, reason: lock.reason }
          : { locked: false };
        await next();
      },

      async listLocked(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        const repo = ctx.db.getRepository('recordLocks');
        if (!repo) { ctx.body = []; return next(); }
        const filter: any = { locked: true };
        if (collectionName) filter.collectionName = collectionName;
        ctx.body = await repo.find({ filter, sort: ['-lockedAt'] });
        await next();
      },
    },
  });

  app.acl.allow('recordLocks', ['check'], 'loggedIn');
  app.acl.registerSnippet({ name: 'pm.acl.record-locks', actions: ['recordLocks:*'] });
}

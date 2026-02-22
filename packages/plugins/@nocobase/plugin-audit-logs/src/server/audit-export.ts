/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Audit Log Export & Analytics API
 *
 * Provides:
 * - Export audit logs as JSON/CSV
 * - User activity statistics
 * - Collection change frequency analysis
 * - Time-based activity trends
 */

export function registerAuditExportActions(app: any) {
  app.resourceManager.define({
    name: 'auditAnalytics',
    actions: {
      /**
       * GET /api/auditAnalytics:export
       * Params: { startDate?, endDate?, collectionName?, userId?, format? }
       */
      async export(ctx: any, next: any) {
        const { startDate, endDate, collectionName, userId, limit = 1000 } = ctx.action.params;

        const filter: any = {};
        if (collectionName) filter.collectionName = collectionName;
        if (userId) filter.userId = parseInt(userId);
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const repo = ctx.db.getRepository('auditLogs');
        if (!repo) { ctx.body = { data: [] }; return next(); }

        const logs = await repo.find({
          filter,
          sort: ['-createdAt'],
          limit: Math.min(parseInt(limit) || 1000, 5000),
          appends: ['user'],
        });

        ctx.body = {
          data: logs.map((log: any) => {
            const d = log.toJSON ? log.toJSON() : log;
            return {
              id: d.id,
              type: d.type,
              collectionName: d.collectionName,
              recordId: d.recordId,
              userId: d.userId,
              userNickname: d.user?.nickname || `User #${d.userId}`,
              createdAt: d.createdAt,
              changedFields: (d.changes || []).map((c: any) => c.field?.name).filter(Boolean),
            };
          }),
          total: logs.length,
        };
        await next();
      },

      /**
       * GET /api/auditAnalytics:userActivity
       * Returns activity statistics per user.
       */
      async userActivity(ctx: any, next: any) {
        const { days = 30 } = ctx.action.params;
        const since = new Date(Date.now() - parseInt(days) * 86400000);

        const repo = ctx.db.getRepository('auditLogs');
        if (!repo) { ctx.body = { users: [] }; return next(); }

        const logs = await repo.find({
          filter: { createdAt: { $gte: since } },
          fields: ['userId', 'type', 'collectionName'],
          limit: 10000,
        });

        const userStats: Record<number, { creates: number; updates: number; deletes: number; total: number }> = {};
        for (const log of logs) {
          const d = log.toJSON ? log.toJSON() : log;
          const uid = d.userId || 0;
          if (!userStats[uid]) userStats[uid] = { creates: 0, updates: 0, deletes: 0, total: 0 };
          userStats[uid].total++;
          if (d.type === 'create') userStats[uid].creates++;
          else if (d.type === 'update') userStats[uid].updates++;
          else if (d.type === 'destroy') userStats[uid].deletes++;
        }

        const users = Object.entries(userStats)
          .map(([uid, stats]) => ({ userId: parseInt(uid), ...stats }))
          .sort((a, b) => b.total - a.total);

        ctx.body = { days: parseInt(days), users, totalActions: logs.length };
        await next();
      },

      /**
       * GET /api/auditAnalytics:collectionActivity
       * Returns which collections are most frequently modified.
       */
      async collectionActivity(ctx: any, next: any) {
        const { days = 30 } = ctx.action.params;
        const since = new Date(Date.now() - parseInt(days) * 86400000);

        const repo = ctx.db.getRepository('auditLogs');
        if (!repo) { ctx.body = { collections: [] }; return next(); }

        const logs = await repo.find({
          filter: { createdAt: { $gte: since } },
          fields: ['collectionName', 'type'],
          limit: 10000,
        });

        const colStats: Record<string, { creates: number; updates: number; deletes: number; total: number }> = {};
        for (const log of logs) {
          const d = log.toJSON ? log.toJSON() : log;
          const col = d.collectionName || 'unknown';
          if (!colStats[col]) colStats[col] = { creates: 0, updates: 0, deletes: 0, total: 0 };
          colStats[col].total++;
          if (d.type === 'create') colStats[col].creates++;
          else if (d.type === 'update') colStats[col].updates++;
          else if (d.type === 'destroy') colStats[col].deletes++;
        }

        const collections = Object.entries(colStats)
          .map(([name, stats]) => ({ collectionName: name, ...stats }))
          .sort((a, b) => b.total - a.total);

        ctx.body = { days: parseInt(days), collections, totalActions: logs.length };
        await next();
      },
    },
  });

  app.acl.registerSnippet({
    name: 'pm.audit-logs.analytics',
    actions: ['auditAnalytics:*'],
  });
}

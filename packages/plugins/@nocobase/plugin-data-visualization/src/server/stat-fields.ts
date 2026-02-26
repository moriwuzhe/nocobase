/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Statistical Fields API
 *
 * Like MingDaoYun's summary fields, computes aggregate values
 * from related/child records:
 *
 * Examples:
 * - Customer's total deal amount (SUM of crmDeals.amount WHERE customerId=X)
 * - Project's task completion rate (COUNT done tasks / COUNT all tasks)
 * - Order's item count (COUNT of orderItems WHERE orderId=X)
 *
 * Returns computed values without storing them (real-time calculation).
 */

export function registerStatFieldActions(app: any) {
  app.resourceManager.define({
    name: 'statFields',
    actions: {
      /**
       * POST /api/statFields:compute
       * Body: {
       *   sourceCollection: 'crmCustomers',
       *   sourceId: 1,
       *   targetCollection: 'crmDeals',
       *   foreignKey: 'customerId',
       *   metrics: [
       *     { type: 'count', alias: 'dealCount' },
       *     { type: 'sum', field: 'amount', alias: 'totalAmount' },
       *     { type: 'avg', field: 'amount', alias: 'avgDealSize' }
       *   ],
       *   filter?: { stage: { $ne: 'closed_lost' } }
       * }
       */
      async compute(ctx: any, next: any) {
        const { sourceCollection, sourceId, targetCollection, foreignKey, metrics, filter } = ctx.action.params.values || {};

        if (!targetCollection || !foreignKey || !sourceId || !metrics?.length) {
          return ctx.throw(400, 'targetCollection, foreignKey, sourceId, and metrics are required');
        }

        const repo = ctx.db.getRepository(targetCollection);
        if (!repo) return ctx.throw(404, `Collection "${targetCollection}" not found`);

        const queryFilter: any = { [foreignKey]: sourceId, ...filter };
        const records = await repo.find({ filter: queryFilter, limit: 10000 });
        const items = (records || []).map((r: any) => (r.toJSON ? r.toJSON() : r));

        const result: Record<string, number> = {};
        for (const metric of metrics) {
          const alias = metric.alias || `${metric.type}_${metric.field || 'count'}`;
          const values = metric.field ? items.map((i: any) => Number(i[metric.field]) || 0) : [];

          switch (metric.type) {
            case 'count':
              result[alias] = items.length;
              break;
            case 'sum':
              result[alias] = Math.round(values.reduce((a: number, b: number) => a + b, 0) * 100) / 100;
              break;
            case 'avg':
              result[alias] = values.length ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 100) / 100 : 0;
              break;
            case 'min':
              result[alias] = values.length ? Math.min(...values) : 0;
              break;
            case 'max':
              result[alias] = values.length ? Math.max(...values) : 0;
              break;
            case 'countWhere': {
              const whereField = metric.whereField;
              const whereValue = metric.whereValue;
              result[alias] = whereField ? items.filter((i: any) => i[whereField] === whereValue).length : items.length;
              break;
            }
            default:
              result[alias] = items.length;
          }
        }

        ctx.body = {
          sourceCollection,
          sourceId,
          targetCollection,
          recordCount: items.length,
          stats: result,
        };
        await next();
      },

      /**
       * POST /api/statFields:batchCompute
       * Body: { sourceCollection, sourceIds: [1,2,3], targetCollection, foreignKey, metrics }
       * Computes stats for multiple source records at once.
       */
      async batchCompute(ctx: any, next: any) {
        const { sourceCollection, sourceIds, targetCollection, foreignKey, metrics, filter } = ctx.action.params.values || {};

        if (!targetCollection || !foreignKey || !sourceIds?.length || !metrics?.length) {
          return ctx.throw(400, 'Required fields missing');
        }

        const repo = ctx.db.getRepository(targetCollection);
        if (!repo) return ctx.throw(404);

        const queryFilter: any = { [foreignKey]: { $in: sourceIds }, ...filter };
        const records = await repo.find({ filter: queryFilter, limit: 50000 });
        const items = (records || []).map((r: any) => (r.toJSON ? r.toJSON() : r));

        // Group by source
        const grouped: Record<string | number, any[]> = {};
        for (const item of items) {
          const key = item[foreignKey];
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        }

        const results: Record<string | number, Record<string, number>> = {};
        for (const sid of sourceIds) {
          const group = grouped[sid] || [];
          results[sid] = {};
          for (const metric of metrics) {
            const alias = metric.alias || `${metric.type}_${metric.field || 'count'}`;
            const values = metric.field ? group.map((i: any) => Number(i[metric.field]) || 0) : [];
            switch (metric.type) {
              case 'count': results[sid][alias] = group.length; break;
              case 'sum': results[sid][alias] = Math.round(values.reduce((a: number, b: number) => a + b, 0) * 100) / 100; break;
              case 'avg': results[sid][alias] = values.length ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 100) / 100 : 0; break;
              default: results[sid][alias] = group.length;
            }
          }
        }

        ctx.body = { results };
        await next();
      },
    },
  });

  app.acl.allow('statFields', ['compute', 'batchCompute'], 'loggedIn');
}

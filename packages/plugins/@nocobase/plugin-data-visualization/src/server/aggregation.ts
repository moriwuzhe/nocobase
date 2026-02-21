/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Aggregation API
 *
 * Provides server-side aggregation functions for dashboards:
 * - count, sum, avg, min, max
 * - group by field
 * - date range filtering
 * - multiple metrics in one request
 */

export function registerAggregationActions(app: any) {
  app.resourceManager.define({
    name: 'dataAggregation',
    actions: {
      /**
       * POST /api/dataAggregation:query
       * Body: {
       *   collection: string,
       *   metrics: [{ type: 'count'|'sum'|'avg'|'min'|'max', field?: string, alias?: string }],
       *   groupBy?: string,
       *   filter?: object,
       *   dateRange?: { field: string, start?: string, end?: string }
       * }
       */
      async query(ctx: any, next: any) {
        const { collection, metrics, groupBy, filter, dateRange } = ctx.action.params.values || {};

        if (!collection) return ctx.throw(400, 'collection is required');
        if (!metrics?.length) return ctx.throw(400, 'metrics is required');

        const repo = ctx.db.getRepository(collection);
        if (!repo) return ctx.throw(404, `Collection "${collection}" not found`);

        const queryFilter: any = { ...filter };
        if (dateRange?.field) {
          queryFilter[dateRange.field] = {};
          if (dateRange.start) queryFilter[dateRange.field].$gte = new Date(dateRange.start);
          if (dateRange.end) queryFilter[dateRange.field].$lte = new Date(dateRange.end);
        }

        try {
          if (groupBy) {
            const records = await repo.find({ filter: queryFilter, limit: 5000 });
            const dataList = (records || []).map((r: any) => (r.toJSON ? r.toJSON() : r));

            const groups: Record<string, any[]> = {};
            for (const item of dataList) {
              const key = String(item[groupBy] || '其他');
              if (!groups[key]) groups[key] = [];
              groups[key].push(item);
            }

            const result = Object.entries(groups).map(([key, items]) => {
              const row: Record<string, any> = { [groupBy]: key };
              for (const metric of metrics) {
                const alias = metric.alias || `${metric.type}_${metric.field || 'count'}`;
                row[alias] = computeMetric(items, metric);
              }
              return row;
            });

            ctx.body = { data: result, groupBy, total: result.length };
          } else {
            const records = await repo.find({ filter: queryFilter, limit: 10000 });
            const dataList = (records || []).map((r: any) => (r.toJSON ? r.toJSON() : r));

            const result: Record<string, any> = {};
            for (const metric of metrics) {
              const alias = metric.alias || `${metric.type}_${metric.field || 'count'}`;
              result[alias] = computeMetric(dataList, metric);
            }

            ctx.body = { data: result, total: dataList.length };
          }
        } catch (err: any) {
          ctx.body = { error: err.message };
        }

        await next();
      },
    },
  });

  app.acl.allow('dataAggregation', 'query', 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.data-visualization.aggregation',
    actions: ['dataAggregation:*'],
  });
}

function computeMetric(items: any[], metric: { type: string; field?: string }): number {
  if (metric.type === 'count') return items.length;

  if (!metric.field) return items.length;

  const values = items
    .map((item) => Number(item[metric.field!]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return 0;

  switch (metric.type) {
    case 'sum':
      return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
    case 'avg':
      return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.length;
  }
}

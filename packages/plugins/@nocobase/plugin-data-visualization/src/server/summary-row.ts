/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Summary Row API
 *
 * Like MingDaoYun's table footer summary, computes aggregate
 * values for displayed table data (sum, avg, count, min, max).
 *
 * Used by the client to show a summary row at the bottom of tables.
 */

export function registerSummaryRowActions(app: any) {
  app.resourceManager.define({
    name: 'summaryRow',
    actions: {
      /**
       * POST /api/summaryRow:compute
       * Body: { collectionName, fields: [{name, type}], filter? }
       * Returns: { fieldName: value }
       */
      async compute(ctx: any, next: any) {
        const { collectionName, fields, filter } = ctx.action.params.values || {};
        if (!collectionName || !fields?.length) return ctx.throw(400, 'collectionName and fields required');

        const repo = ctx.db.getRepository(collectionName);
        if (!repo) return ctx.throw(404);

        const records = await repo.find({ filter: filter || {}, limit: 50000 });
        const items = (records || []).map((r: any) => (r.toJSON ? r.toJSON() : r));

        const summary: Record<string, any> = { _count: items.length };

        for (const field of fields) {
          const values = items.map((i: any) => Number(i[field.name])).filter((v: number) => !isNaN(v));

          switch (field.type || 'sum') {
            case 'sum':
              summary[field.name] = Math.round(values.reduce((a: number, b: number) => a + b, 0) * 100) / 100;
              break;
            case 'avg':
              summary[field.name] = values.length ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 100) / 100 : 0;
              break;
            case 'min':
              summary[field.name] = values.length ? Math.min(...values) : 0;
              break;
            case 'max':
              summary[field.name] = values.length ? Math.max(...values) : 0;
              break;
            case 'count':
              summary[field.name] = items.filter((i: any) => i[field.name] != null && i[field.name] !== '').length;
              break;
            default:
              summary[field.name] = values.reduce((a: number, b: number) => a + b, 0);
          }
        }

        ctx.body = { collection: collectionName, totalRecords: items.length, summary };
        await next();
      },
    },
  });

  app.acl.allow('summaryRow', 'compute', 'loggedIn');
}

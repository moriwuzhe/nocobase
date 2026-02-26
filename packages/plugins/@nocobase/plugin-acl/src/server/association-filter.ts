/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Association Filter API
 *
 * Like MingDaoYun's cascading filter for association fields.
 * When selecting a related record, filters available options
 * based on the current record's values.
 *
 * Example: When selecting a Contact, only show contacts
 * belonging to the currently selected Customer.
 */

export function registerAssociationFilterActions(app: any) {
  app.resourceManager.define({
    name: 'associationFilter',
    actions: {
      /**
       * POST /api/associationFilter:getOptions
       * Body: {
       *   targetCollection: 'crmContacts',
       *   labelField: 'name',
       *   valueField: 'id',
       *   filter: { customerId: 5 },
       *   keyword?: 'search text',
       *   limit?: 50
       * }
       */
      async getOptions(ctx: any, next: any) {
        const { targetCollection, labelField, valueField, filter, keyword, limit = 50 } = ctx.action.params.values || ctx.action.params;
        if (!targetCollection) return ctx.throw(400, 'targetCollection required');

        const repo = ctx.db.getRepository(targetCollection);
        if (!repo) return ctx.throw(404);

        const queryFilter: any = { ...filter };
        if (keyword && labelField) {
          queryFilter[labelField] = { $includes: keyword };
        }

        const records = await repo.find({
          filter: queryFilter,
          fields: [valueField || 'id', labelField || 'id'],
          limit: Math.min(parseInt(String(limit)) || 50, 200),
          sort: [labelField || 'id'],
        });

        ctx.body = records.map((r: any) => {
          const d = r.toJSON ? r.toJSON() : r;
          return {
            value: d[valueField || 'id'],
            label: d[labelField || 'id'] || `#${d.id}`,
          };
        });
        await next();
      },

      /**
       * GET /api/associationFilter:getCascadeConfig?collectionName=xxx
       * Returns configured cascade relationships for a collection.
       */
      async getCascadeConfig(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400);

        const repo = ctx.db.getRepository('associationFilterConfigs');
        if (!repo) { ctx.body = []; return next(); }

        ctx.body = await repo.find({
          filter: { collectionName, enabled: true },
          sort: ['sort'],
        });
        await next();
      },
    },
  });

  app.acl.allow('associationFilter', ['getOptions', 'getCascadeConfig'], 'loggedIn');
}

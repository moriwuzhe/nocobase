/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Relation Graph API
 *
 * Like MingDaoYun's relation visualization, provides a graph
 * representation of how collections are related to each other.
 * Used to render an interactive relationship diagram.
 */

export function registerRelationGraphActions(app: any) {
  app.resourceManager.define({
    name: 'relationGraph',
    actions: {
      /**
       * GET /api/relationGraph:get?collections=col1,col2
       * Returns nodes and edges for the relationship graph.
       */
      async get(ctx: any, next: any) {
        const { collections: colFilter } = ctx.action.params;
        const allCollections = ctx.db.getCollections();
        const filterSet = colFilter ? new Set(colFilter.split(',')) : null;

        const nodes: any[] = [];
        const edges: any[] = [];

        for (const col of allCollections) {
          if (col.name.startsWith('_') || col.options.hidden) continue;
          if (filterSet && !filterSet.has(col.name)) continue;

          const fieldCount = Array.from(col.fields.values()).filter((f: any) => !f.options.hidden).length;
          nodes.push({
            id: col.name,
            label: col.options.title || col.name,
            fieldCount,
            category: col.options.category || 'default',
          });

          for (const field of col.fields.values()) {
            if (['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'].includes(field.type)) {
              const target = field.options.target;
              if (target && (!filterSet || filterSet.has(target))) {
                edges.push({
                  source: col.name,
                  target,
                  type: field.type,
                  fieldName: field.name,
                  label: field.type === 'belongsTo' ? 'N:1' : field.type === 'hasMany' ? '1:N' : field.type === 'belongsToMany' ? 'N:N' : '1:1',
                });
              }
            }
          }
        }

        ctx.body = { nodes, edges, nodeCount: nodes.length, edgeCount: edges.length };
        await next();
      },

      /**
       * GET /api/relationGraph:getFieldDetails?collectionName=xxx
       */
      async getFieldDetails(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400);

        const col = ctx.db.getCollection(collectionName);
        if (!col) return ctx.throw(404);

        const fields = Array.from(col.fields.values()).map((f: any) => ({
          name: f.name,
          type: f.type,
          title: f.options.uiSchema?.title || f.name,
          interface: f.options.interface,
          target: f.options.target,
          required: !!f.options.uiSchema?.required,
        }));

        ctx.body = {
          name: col.name,
          title: col.options.title,
          fields,
          relations: fields.filter((f) => f.target),
        };
        await next();
      },
    },
  });

  app.acl.allow('relationGraph', ['get', 'getFieldDetails'], 'loggedIn');
}

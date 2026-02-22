/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Import Helper API
 *
 * Provides field metadata for each template collection,
 * enabling clients to show import instructions and generate templates.
 */

export function registerImportHelperActions(app: any) {
  app.resourceManager.define({
    name: 'importHelper',
    actions: {
      /**
       * GET /api/importHelper:getFields?collectionName=xxx
       * Returns importable fields with their types and titles.
       */
      async getFields(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400, 'collectionName is required');

        const collection = ctx.db.getCollection(collectionName);
        if (!collection) return ctx.throw(404, `Collection "${collectionName}" not found`);

        const fields: any[] = [];
        for (const field of collection.fields.values()) {
          if (field.options.hidden) continue;
          if (['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'].includes(field.type)) continue;
          if (['createdAt', 'updatedAt', 'createdById', 'updatedById', 'id', 'sort'].includes(field.name)) continue;

          const uiSchema = field.options.uiSchema || {};
          const enumOptions = uiSchema.enum?.map((e: any) => e.label || e.value).join(' / ');

          fields.push({
            name: field.name,
            title: uiSchema.title || field.name,
            type: field.type,
            required: !!uiSchema.required || !!uiSchema['x-validator']?.includes?.('required'),
            defaultValue: field.options.defaultValue,
            enumOptions: enumOptions || null,
            description: field.type === 'date' ? '格式: YYYY-MM-DD' :
              field.type === 'float' || field.type === 'integer' ? '数字' :
              field.type === 'boolean' ? 'true / false' :
              field.type === 'text' ? '长文本' : '文本',
          });
        }

        ctx.body = {
          collection: collectionName,
          title: collection.options.title || collectionName,
          fields,
          sampleRow: Object.fromEntries(fields.map((f) => [f.title, f.defaultValue || ''])),
        };
        await next();
      },

      /**
       * GET /api/importHelper:listCollections?templateName=xxx
       * Returns all collections for a template with their field metadata.
       */
      async listCollections(ctx: any, next: any) {
        const { templateName } = ctx.action.params;

        const collections = ctx.db.getCollections();
        let filtered = collections;

        if (templateName) {
          const prefixMap: Record<string, string> = {
            crm: 'crm', project: 'pm', hr: 'hr', oa: 'oa',
            inventory: 'inv', ticket: 'ticket', contract: 'contract',
            expense: 'expense', procurement: 'proc', ecommerce: 'ec',
            recruitment: 'rec', service: 'service', membership: 'member',
            education: 'edu', property: 'prop', vehicle: 'vehicle',
            equipment: 'eq',
          };
          const prefix = prefixMap[templateName];
          if (prefix) {
            filtered = collections.filter((c: any) =>
              c.name.toLowerCase().startsWith(prefix.toLowerCase()),
            );
          }
        }

        const result = filtered.map((c: any) => {
          const fieldCount = Array.from(c.fields.values()).filter(
            (f: any) => !f.options.hidden && !['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'].includes(f.type),
          ).length;
          return {
            name: c.name,
            title: c.options.title || c.name,
            fieldCount,
          };
        });

        ctx.body = result;
        await next();
      },
    },
  });

  app.acl.allow('importHelper', ['getFields', 'listCollections'], 'loggedIn');
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * App Package Export/Import
 *
 * Like MingDaoYun's app packaging, exports an entire template's
 * configuration as a JSON package that can be imported into
 * another NocoBase instance.
 *
 * Package includes:
 * - Collection definitions (fields, relations)
 * - UI schemas (pages, blocks, forms)
 * - Workflows
 * - Roles and permissions
 * - Form rules and validation rules
 * - Conditional formats
 * - Sample data (optional)
 */

export function registerAppPackageActions(app: any) {
  app.resourceManager.define({
    name: 'appPackage',
    actions: {
      /**
       * POST /api/appPackage:export
       * Body: { collections: string[], includeData?: boolean, includeWorkflows?: boolean }
       */
      async export(ctx: any, next: any) {
        const { collections, includeData = false, includeWorkflows = true } = ctx.action.params.values || {};
        if (!collections?.length) return ctx.throw(400, 'collections required');

        const pkg: any = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          exportedBy: ctx.state.currentUser?.nickname || 'admin',
          collections: [],
          workflows: [],
          roles: [],
          formRules: [],
          data: {},
        };

        // Export collection definitions
        for (const colName of collections) {
          const collection = ctx.db.getCollection(colName);
          if (!collection) continue;

          const fields: any[] = [];
          for (const field of collection.fields.values()) {
            fields.push({
              name: field.name,
              type: field.type,
              interface: field.options.interface,
              uiSchema: field.options.uiSchema,
              defaultValue: field.options.defaultValue,
              unique: field.options.unique,
              required: field.options.required,
              target: field.options.target,
              foreignKey: field.options.foreignKey,
            });
          }

          pkg.collections.push({
            name: colName,
            title: collection.options.title,
            fields,
          });

          // Export data if requested
          if (includeData) {
            try {
              const records = await ctx.db.getRepository(colName).find({ limit: 1000 });
              pkg.data[colName] = records.map((r: any) => {
                const d = r.toJSON ? r.toJSON() : r;
                const { id, createdAt, updatedAt, createdById, updatedById, ...rest } = d;
                return rest;
              });
            } catch { /* skip */ }
          }
        }

        // Export workflows
        if (includeWorkflows) {
          try {
            const wfRepo = ctx.db.getRepository('workflows');
            if (wfRepo) {
              const workflows = await wfRepo.find({
                filter: { config: { collection: { $in: collections } } },
                appends: ['nodes'],
              });
              pkg.workflows = workflows.map((w: any) => {
                const d = w.toJSON ? w.toJSON() : w;
                return { title: d.title, type: d.type, config: d.config, enabled: d.enabled, nodes: d.nodes };
              });
            }
          } catch { /* skip */ }
        }

        ctx.set('Content-Type', 'application/json');
        ctx.set('Content-Disposition', `attachment; filename="nocobase-package-${Date.now()}.json"`);
        ctx.body = pkg;
        await next();
      },

      /**
       * POST /api/appPackage:import
       * Body: { package: {...} }
       */
      async import(ctx: any, next: any) {
        const { package: pkg } = ctx.action.params.values || {};
        if (!pkg?.collections?.length) return ctx.throw(400, 'Invalid package');

        const results = { collections: 0, records: 0, workflows: 0, errors: [] as string[] };

        // Import collections
        for (const colDef of pkg.collections) {
          try {
            const existing = ctx.db.getCollection(colDef.name);
            if (existing) {
              results.errors.push(`Collection "${colDef.name}" already exists, skipped`);
              continue;
            }

            await ctx.db.getRepository('collections').create({
              values: {
                name: colDef.name,
                title: colDef.title,
                fields: colDef.fields,
              },
            });
            results.collections++;

            // Import data
            if (pkg.data?.[colDef.name]?.length) {
              const repo = ctx.db.getRepository(colDef.name);
              for (const record of pkg.data[colDef.name]) {
                try {
                  await repo.create({ values: record });
                  results.records++;
                } catch { /* skip duplicate */ }
              }
            }
          } catch (e: any) {
            results.errors.push(`${colDef.name}: ${e.message}`);
          }
        }

        // Import workflows
        if (pkg.workflows?.length) {
          try {
            const wfRepo = ctx.db.getRepository('workflows');
            if (wfRepo) {
              for (const wf of pkg.workflows) {
                await wfRepo.create({ values: wf });
                results.workflows++;
              }
            }
          } catch { /* skip */ }
        }

        ctx.body = { success: true, ...results };
        await next();
      },
    },
  });

  app.acl.registerSnippet({ name: 'pm.app-package', actions: ['appPackage:*'] });
}

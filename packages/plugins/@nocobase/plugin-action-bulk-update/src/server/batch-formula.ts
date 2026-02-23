/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Batch Update Formula API
 *
 * Like MingDaoYun's batch update with expressions.
 * Allows updating multiple records using formula expressions.
 *
 * Examples:
 * - Set all prices to price * 1.1 (10% increase)
 * - Set status to 'archived' for all records older than 30 days
 * - Calculate and set a field based on other fields
 */

export function registerBatchFormulaActions(app: any) {
  app.resourceManager.define({
    name: 'batchFormula',
    actions: {
      /**
       * POST /api/batchFormula:execute
       * Body: {
       *   collectionName: string,
       *   filter: object,
       *   updates: [
       *     { field: 'price', formula: 'multiply', operand: 1.1 },
       *     { field: 'status', value: 'archived' },
       *     { field: 'discount', formula: 'set', value: 0 }
       *   ]
       * }
       */
      async execute(ctx: any, next: any) {
        const { collectionName, filter, updates } = ctx.action.params.values || {};
        if (!collectionName || !updates?.length) return ctx.throw(400, 'collectionName and updates required');

        const repo = ctx.db.getRepository(collectionName);
        if (!repo) return ctx.throw(404);

        const records = await repo.find({ filter: filter || {}, limit: 10000 });
        let updated = 0;

        for (const record of records) {
          const data = record.toJSON ? record.toJSON() : record;
          const newValues: Record<string, any> = {};

          for (const update of updates) {
            if (!update.field) continue;

            if (update.formula) {
              const currentValue = Number(data[update.field]) || 0;
              const operand = Number(update.operand) || 0;

              switch (update.formula) {
                case 'add': newValues[update.field] = currentValue + operand; break;
                case 'subtract': newValues[update.field] = currentValue - operand; break;
                case 'multiply': newValues[update.field] = Math.round(currentValue * operand * 100) / 100; break;
                case 'divide': newValues[update.field] = operand !== 0 ? Math.round((currentValue / operand) * 100) / 100 : currentValue; break;
                case 'set': newValues[update.field] = update.value; break;
                case 'clear': newValues[update.field] = null; break;
                case 'copyFrom': newValues[update.field] = data[update.sourceField]; break;
                case 'concat': newValues[update.field] = `${data[update.field] || ''}${update.value || ''}`; break;
              }
            } else if ('value' in update) {
              newValues[update.field] = update.value;
            }
          }

          if (Object.keys(newValues).length > 0) {
            try {
              await repo.update({ filterByTk: data.id, values: newValues });
              updated++;
            } catch { /* skip individual errors */ }
          }
        }

        ctx.body = { success: true, matched: records.length, updated };
        await next();
      },

      /**
       * GET /api/batchFormula:getFormulas
       */
      async getFormulas(ctx: any, next: any) {
        ctx.body = [
          { value: 'add', label: '加', description: '当前值 + 操作数' },
          { value: 'subtract', label: '减', description: '当前值 - 操作数' },
          { value: 'multiply', label: '乘', description: '当前值 × 操作数' },
          { value: 'divide', label: '除', description: '当前值 ÷ 操作数' },
          { value: 'set', label: '设置为', description: '设为指定值' },
          { value: 'clear', label: '清空', description: '设为空值' },
          { value: 'copyFrom', label: '复制自', description: '从其他字段复制值' },
          { value: 'concat', label: '追加', description: '在现有值后追加文本' },
        ];
        await next();
      },

      /**
       * POST /api/batchFormula:preview
       * Same as execute but returns preview without actually updating.
       */
      async preview(ctx: any, next: any) {
        const { collectionName, filter, updates, limit = 5 } = ctx.action.params.values || {};
        if (!collectionName || !updates?.length) return ctx.throw(400);

        const repo = ctx.db.getRepository(collectionName);
        if (!repo) return ctx.throw(404);

        const records = await repo.find({ filter: filter || {}, limit: Math.min(parseInt(String(limit)), 10) });
        const previews = records.map((record: any) => {
          const data = record.toJSON ? record.toJSON() : record;
          const changes: Record<string, { before: any; after: any }> = {};

          for (const update of updates) {
            if (!update.field) continue;
            const before = data[update.field];
            let after = before;

            if (update.formula) {
              const cur = Number(before) || 0;
              const op = Number(update.operand) || 0;
              switch (update.formula) {
                case 'add': after = cur + op; break;
                case 'subtract': after = cur - op; break;
                case 'multiply': after = Math.round(cur * op * 100) / 100; break;
                case 'divide': after = op !== 0 ? Math.round((cur / op) * 100) / 100 : cur; break;
                case 'set': after = update.value; break;
                case 'clear': after = null; break;
              }
            } else if ('value' in update) {
              after = update.value;
            }

            if (JSON.stringify(before) !== JSON.stringify(after)) {
              changes[update.field] = { before, after };
            }
          }

          return { id: data.id, changes };
        });

        ctx.body = { matched: records.length, previews };
        await next();
      },
    },
  });

  app.acl.registerSnippet({ name: 'pm.batch-formula', actions: ['batchFormula:*'] });
}

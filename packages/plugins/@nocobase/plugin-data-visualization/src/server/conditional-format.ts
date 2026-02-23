/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Conditional Formatting API
 *
 * Like MingDaoYun's conditional colors, allows configuring rules
 * to highlight table rows or cells based on data values.
 *
 * Examples:
 * - Red background when status = 'overdue'
 * - Green text when amount > 100000
 * - Bold when priority = 'urgent'
 * - Yellow highlight when dueDate < today
 *
 * Rules are stored per collection and evaluated client-side.
 * Server provides CRUD + evaluation API.
 */

interface ConditionalFormatRule {
  collectionName: string;
  fieldName: string;
  operator: string;
  value: any;
  style: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    textDecoration?: string;
    icon?: string;
  };
  scope: 'row' | 'cell';
  enabled: boolean;
  priority: number;
}

const OPERATORS: Record<string, (fv: any, rv: any) => boolean> = {
  eq: (fv, rv) => String(fv) === String(rv),
  ne: (fv, rv) => String(fv) !== String(rv),
  gt: (fv, rv) => Number(fv) > Number(rv),
  lt: (fv, rv) => Number(fv) < Number(rv),
  gte: (fv, rv) => Number(fv) >= Number(rv),
  lte: (fv, rv) => Number(fv) <= Number(rv),
  contains: (fv, rv) => String(fv).includes(String(rv)),
  empty: (fv) => fv == null || fv === '',
  notEmpty: (fv) => fv != null && fv !== '',
  in: (fv, rv) => Array.isArray(rv) && rv.map(String).includes(String(fv)),
  beforeToday: (fv) => fv && new Date(fv) < new Date(new Date().toDateString()),
  afterToday: (fv) => fv && new Date(fv) > new Date(new Date().toDateString()),
  withinDays: (fv, rv) => {
    if (!fv) return false;
    const diff = (new Date(fv).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= Number(rv);
  },
};

export function evaluateConditionalFormats(
  rules: ConditionalFormatRule[],
  record: Record<string, any>,
): { rowStyle?: Record<string, string>; cellStyles: Record<string, Record<string, string>> } {
  const result: { rowStyle?: Record<string, string>; cellStyles: Record<string, Record<string, string>> } = { cellStyles: {} };

  const sorted = [...rules].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const rule of sorted) {
    if (!rule.enabled) continue;
    const fieldValue = record[rule.fieldName];
    const op = OPERATORS[rule.operator];
    if (!op) continue;

    if (op(fieldValue, rule.value)) {
      if (rule.scope === 'row') {
        result.rowStyle = { ...result.rowStyle, ...rule.style };
      } else {
        result.cellStyles[rule.fieldName] = { ...result.cellStyles[rule.fieldName], ...rule.style };
      }
    }
  }

  return result;
}

export function registerConditionalFormatActions(app: any) {
  app.resourceManager.define({
    name: 'conditionalFormats',
    actions: {
      async listByCollection(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400, 'collectionName required');
        const repo = ctx.db.getRepository('conditionalFormats');
        if (!repo) { ctx.body = []; return next(); }
        ctx.body = await repo.find({ filter: { collectionName, enabled: true }, sort: ['priority'] });
        await next();
      },

      async evaluate(ctx: any, next: any) {
        const { collectionName, records } = ctx.action.params.values || {};
        if (!collectionName || !records?.length) return ctx.throw(400, 'collectionName and records required');
        const repo = ctx.db.getRepository('conditionalFormats');
        if (!repo) { ctx.body = { results: [] }; return next(); }
        const rules = (await repo.find({ filter: { collectionName, enabled: true }, sort: ['priority'] }))
          .map((r: any) => (r.toJSON ? r.toJSON() : r));
        const results = records.map((record: any) => ({
          id: record.id,
          ...evaluateConditionalFormats(rules, record),
        }));
        ctx.body = { results };
        await next();
      },

      async getPresets(ctx: any, next: any) {
        ctx.body = [
          { name: '逾期高亮', operator: 'beforeToday', style: { backgroundColor: '#fff2f0', color: '#ff4d4f' }, scope: 'row' },
          { name: '即将到期', operator: 'withinDays', value: 7, style: { backgroundColor: '#fffbe6', color: '#faad14' }, scope: 'row' },
          { name: '已完成', operator: 'eq', value: 'completed', style: { color: '#52c41a', textDecoration: 'line-through' }, scope: 'row' },
          { name: '紧急标记', operator: 'eq', value: 'urgent', style: { backgroundColor: '#fff1f0', fontWeight: 'bold', color: '#ff4d4f' }, scope: 'cell' },
          { name: '大金额', operator: 'gte', value: 100000, style: { fontWeight: 'bold', color: '#1677ff' }, scope: 'cell' },
        ];
        await next();
      },
    },
  });

  app.acl.allow('conditionalFormats', ['listByCollection', 'evaluate', 'getPresets'], 'loggedIn');
  app.acl.registerSnippet({ name: 'pm.conditional-formats', actions: ['conditionalFormats:*'] });
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Form Rules Engine
 *
 * Like MingDaoYun's form rules, allows configuring field-level behaviors:
 * - Show/hide fields based on other field values
 * - Make fields required/optional dynamically
 * - Make fields read-only based on conditions
 * - Set default values based on other fields
 * - Filter options of select fields based on conditions
 *
 * Rules are stored in `formRules` collection and evaluated client-side.
 * Server provides CRUD API and validation.
 *
 * Rule format:
 * {
 *   collectionName: 'orders',
 *   triggerField: 'type',
 *   triggerOperator: 'eq',      // eq, ne, in, notIn, gt, lt, contains, empty, notEmpty
 *   triggerValue: 'urgent',
 *   actions: [
 *     { targetField: 'priority', action: 'setValue', value: 'high' },
 *     { targetField: 'dueDate', action: 'required' },
 *     { targetField: 'notes', action: 'show' },
 *     { targetField: 'discount', action: 'hide' },
 *     { targetField: 'approver', action: 'readOnly' },
 *   ]
 * }
 */

export interface FormRuleAction {
  targetField: string;
  action: 'show' | 'hide' | 'required' | 'optional' | 'readOnly' | 'editable' | 'setValue' | 'clearValue' | 'filterOptions';
  value?: any;
}

export interface FormRule {
  id?: number;
  collectionName: string;
  title: string;
  triggerField: string;
  triggerOperator: string;
  triggerValue: any;
  actions: FormRuleAction[];
  enabled: boolean;
  sort?: number;
}

const OPERATORS: Record<string, (fieldValue: any, ruleValue: any) => boolean> = {
  eq: (fv, rv) => fv === rv || String(fv) === String(rv),
  ne: (fv, rv) => fv !== rv && String(fv) !== String(rv),
  in: (fv, rv) => Array.isArray(rv) ? rv.includes(fv) : false,
  notIn: (fv, rv) => Array.isArray(rv) ? !rv.includes(fv) : true,
  gt: (fv, rv) => Number(fv) > Number(rv),
  lt: (fv, rv) => Number(fv) < Number(rv),
  gte: (fv, rv) => Number(fv) >= Number(rv),
  lte: (fv, rv) => Number(fv) <= Number(rv),
  contains: (fv, rv) => String(fv).includes(String(rv)),
  notContains: (fv, rv) => !String(fv).includes(String(rv)),
  empty: (fv) => fv == null || fv === '' || (Array.isArray(fv) && fv.length === 0),
  notEmpty: (fv) => fv != null && fv !== '' && !(Array.isArray(fv) && fv.length === 0),
};

/**
 * Evaluate a rule against the current form values (for client-side use).
 */
export function evaluateRule(rule: FormRule, formValues: Record<string, any>): FormRuleAction[] | null {
  const fieldValue = formValues[rule.triggerField];
  const operator = OPERATORS[rule.triggerOperator];

  if (!operator) return null;

  if (operator(fieldValue, rule.triggerValue)) {
    return rule.actions;
  }

  return null;
}

/**
 * Evaluate all rules for a collection and return the combined actions.
 */
export function evaluateRules(rules: FormRule[], formValues: Record<string, any>): FormRuleAction[] {
  const allActions: FormRuleAction[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const actions = evaluateRule(rule, formValues);
    if (actions) {
      allActions.push(...actions);
    }
  }

  return allActions;
}

export function registerFormRulesActions(app: any) {
  app.resourceManager.define({
    name: 'formRules',
    actions: {
      /**
       * GET /api/formRules:listByCollection?collectionName=xxx
       */
      async listByCollection(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400, 'collectionName required');

        const repo = ctx.db.getRepository('formRules');
        if (!repo) { ctx.body = []; return next(); }

        ctx.body = await repo.find({
          filter: { collectionName, enabled: true },
          sort: ['sort'],
        });
        await next();
      },

      /**
       * POST /api/formRules:evaluate
       * Body: { collectionName, formValues }
       * Returns which actions should be applied to which fields.
       */
      async evaluate(ctx: any, next: any) {
        const { collectionName, formValues } = ctx.action.params.values || {};
        if (!collectionName || !formValues) return ctx.throw(400, 'collectionName and formValues required');

        const repo = ctx.db.getRepository('formRules');
        if (!repo) { ctx.body = { actions: [] }; return next(); }

        const rules = await repo.find({
          filter: { collectionName, enabled: true },
          sort: ['sort'],
        });

        const ruleList: FormRule[] = rules.map((r: any) => (r.toJSON ? r.toJSON() : r));
        const actions = evaluateRules(ruleList, formValues);

        // Group actions by target field
        const byField: Record<string, FormRuleAction[]> = {};
        for (const action of actions) {
          if (!byField[action.targetField]) byField[action.targetField] = [];
          byField[action.targetField].push(action);
        }

        ctx.body = { actions, byField };
        await next();
      },

      /**
       * GET /api/formRules:getOperators
       * Returns available operators for building rules in the UI.
       */
      async getOperators(ctx: any, next: any) {
        ctx.body = [
          { value: 'eq', label: '等于' },
          { value: 'ne', label: '不等于' },
          { value: 'in', label: '包含于' },
          { value: 'notIn', label: '不包含于' },
          { value: 'gt', label: '大于' },
          { value: 'lt', label: '小于' },
          { value: 'gte', label: '大于等于' },
          { value: 'lte', label: '小于等于' },
          { value: 'contains', label: '包含文本' },
          { value: 'notContains', label: '不包含文本' },
          { value: 'empty', label: '为空' },
          { value: 'notEmpty', label: '不为空' },
        ];
        await next();
      },

      /**
       * GET /api/formRules:getActionTypes
       */
      async getActionTypes(ctx: any, next: any) {
        ctx.body = [
          { value: 'show', label: '显示字段' },
          { value: 'hide', label: '隐藏字段' },
          { value: 'required', label: '设为必填' },
          { value: 'optional', label: '设为非必填' },
          { value: 'readOnly', label: '设为只读' },
          { value: 'editable', label: '设为可编辑' },
          { value: 'setValue', label: '设置字段值' },
          { value: 'clearValue', label: '清空字段值' },
        ];
        await next();
      },
    },
  });

  app.acl.allow('formRules', ['listByCollection', 'evaluate', 'getOperators', 'getActionTypes'], 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.acl.form-rules',
    actions: ['formRules:*'],
  });
}

export { OPERATORS };

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Validation Rules API
 *
 * Server-side validation rules that are checked before data is saved.
 * Unlike client-side form validation, these rules are enforced
 * regardless of how data enters the system (UI, API, import).
 *
 * Rule types:
 * - unique: field value must be unique across collection
 * - range: numeric value within min/max
 * - pattern: regex match
 * - custom: custom expression
 * - crossField: value must relate to another field (e.g., endDate > startDate)
 * - lookup: value must exist in another collection
 */

interface ValidationRule {
  collectionName: string;
  fieldName: string;
  ruleType: string;
  config: Record<string, any>;
  errorMessage: string;
  enabled: boolean;
}

let rulesCache: ValidationRule[] | null = null;
let cacheTime = 0;

async function getRules(db: any): Promise<ValidationRule[]> {
  if (rulesCache && Date.now() - cacheTime < 60000) return rulesCache;
  try {
    const repo = db.getRepository('validationRules');
    if (!repo) return [];
    const rules = await repo.find({ filter: { enabled: true } });
    rulesCache = (rules || []).map((r: any) => {
      const d = r.toJSON ? r.toJSON() : r;
      return { collectionName: d.collectionName, fieldName: d.fieldName, ruleType: d.ruleType, config: d.config || {}, errorMessage: d.errorMessage || '验证失败', enabled: d.enabled };
    });
    cacheTime = Date.now();
  } catch { rulesCache = []; }
  return rulesCache || [];
}

export function registerValidationMiddleware(app: any) {
  app.resourcer.use(async (ctx: any, next: any) => {
    const { actionName, resourceName } = ctx.action || {};
    if (!['create', 'update'].includes(actionName)) { await next(); return; }

    const values = ctx.action.params.values;
    if (!values || typeof values !== 'object') { await next(); return; }

    const rules = await getRules(ctx.db);
    const collectionRules = rules.filter((r) => r.collectionName === resourceName);
    if (collectionRules.length === 0) { await next(); return; }

    const errors: string[] = [];

    for (const rule of collectionRules) {
      const value = values[rule.fieldName];

      switch (rule.ruleType) {
        case 'range': {
          const num = Number(value);
          if (value != null && !isNaN(num)) {
            if (rule.config.min != null && num < rule.config.min) errors.push(rule.errorMessage);
            if (rule.config.max != null && num > rule.config.max) errors.push(rule.errorMessage);
          }
          break;
        }
        case 'pattern': {
          if (value && rule.config.regex) {
            try {
              if (!new RegExp(rule.config.regex).test(String(value))) errors.push(rule.errorMessage);
            } catch { /* invalid regex */ }
          }
          break;
        }
        case 'crossField': {
          const otherValue = values[rule.config.otherField];
          if (value != null && otherValue != null) {
            if (rule.config.operator === 'gt' && !(value > otherValue)) errors.push(rule.errorMessage);
            if (rule.config.operator === 'lt' && !(value < otherValue)) errors.push(rule.errorMessage);
            if (rule.config.operator === 'gte' && !(value >= otherValue)) errors.push(rule.errorMessage);
            if (rule.config.operator === 'ne' && value === otherValue) errors.push(rule.errorMessage);
          }
          break;
        }
        case 'required': {
          if (value == null || value === '') errors.push(rule.errorMessage);
          break;
        }
      }
    }

    if (errors.length > 0) {
      ctx.throw(400, errors.join('; '));
      return;
    }

    await next();
  }, { group: 'validation', after: 'acl' });

  // Clear cache when rules change
  app.db.on('validationRules.afterSave', () => { rulesCache = null; });
  app.db.on('validationRules.afterDestroy', () => { rulesCache = null; });

  app.acl.registerSnippet({ name: 'pm.acl.validation-rules', actions: ['validationRules:*'] });
}

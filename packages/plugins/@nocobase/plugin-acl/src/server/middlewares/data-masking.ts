/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Masking Middleware
 *
 * Applies field-level data masking rules based on the current user's role.
 * Supports masking patterns for sensitive data like phone numbers, ID numbers,
 * email addresses, bank accounts, etc.
 *
 * Masking is applied AFTER data is read from the database but BEFORE it's
 * sent to the client, ensuring the original data is preserved in storage.
 *
 * Configuration is stored in the `dataMaskingRules` collection:
 * - collectionName: target collection
 * - fieldName: target field
 * - maskType: masking strategy (phone, email, idCard, bankAccount, name, custom)
 * - roles: which roles should see masked data (empty = all non-admin roles)
 * - enabled: whether the rule is active
 */

type MaskType = 'phone' | 'email' | 'idCard' | 'bankAccount' | 'name' | 'address' | 'custom';

interface MaskingRule {
  collectionName: string;
  fieldName: string;
  maskType: MaskType;
  customPattern?: string;
  roles?: string[];
  enabled: boolean;
}

const MASKING_STRATEGIES: Record<MaskType, (value: string) => string> = {
  phone: (v) => {
    if (!v || v.length < 7) return v;
    return v.slice(0, 3) + '****' + v.slice(-4);
  },
  email: (v) => {
    if (!v || !v.includes('@')) return v;
    const [local, domain] = v.split('@');
    if (local.length <= 2) return local[0] + '***@' + domain;
    return local[0] + '***' + local.slice(-1) + '@' + domain;
  },
  idCard: (v) => {
    if (!v || v.length < 10) return v;
    return v.slice(0, 6) + '********' + v.slice(-4);
  },
  bankAccount: (v) => {
    if (!v || v.length < 8) return v;
    return v.slice(0, 4) + ' **** **** ' + v.slice(-4);
  },
  name: (v) => {
    if (!v || v.length <= 1) return v;
    if (v.length === 2) return v[0] + '*';
    return v[0] + '*'.repeat(v.length - 2) + v.slice(-1);
  },
  address: (v) => {
    if (!v || v.length < 10) return v;
    return v.slice(0, 6) + '****' + v.slice(-4);
  },
  custom: (v) => {
    if (!v) return v;
    const len = v.length;
    if (len <= 4) return '*'.repeat(len);
    return v.slice(0, 2) + '*'.repeat(Math.min(len - 4, 8)) + v.slice(-2);
  },
};

let rulesCache: MaskingRule[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000;

async function loadRules(db: any): Promise<MaskingRule[]> {
  const now = Date.now();
  if (rulesCache && now - lastCacheTime < CACHE_TTL) {
    return rulesCache;
  }

  try {
    const repo = db.getRepository('dataMaskingRules');
    if (!repo) return [];
    const rules = await repo.find({ filter: { enabled: true } });
    rulesCache = (rules || []).map((r: any) => {
      const data = r.toJSON ? r.toJSON() : r;
      return {
        collectionName: data.collectionName,
        fieldName: data.fieldName,
        maskType: data.maskType || 'custom',
        customPattern: data.customPattern,
        roles: data.roles,
        enabled: data.enabled,
      };
    });
    lastCacheTime = now;
  } catch {
    rulesCache = [];
  }

  return rulesCache || [];
}

function applyMasking(data: any, rules: MaskingRule[], collectionName: string): any {
  if (!data) return data;

  const collectionRules = rules.filter((r) => r.collectionName === collectionName);
  if (collectionRules.length === 0) return data;

  const maskRecord = (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const masked = { ...record };
    for (const rule of collectionRules) {
      const value = masked[rule.fieldName];
      if (value && typeof value === 'string') {
        const strategy = MASKING_STRATEGIES[rule.maskType] || MASKING_STRATEGIES.custom;
        masked[rule.fieldName] = strategy(value);
      }
    }
    return masked;
  };

  if (Array.isArray(data)) {
    return data.map(maskRecord);
  }
  return maskRecord(data);
}

export function dataMaskingMiddleware() {
  return async function dataMasking(ctx: any, next: any) {
    await next();

    if (!ctx.body || ctx.action?.actionName === 'create' || ctx.action?.actionName === 'update') {
      return;
    }

    const currentRole = ctx.state?.currentRole;
    if (currentRole === 'root' || currentRole === 'admin') {
      return;
    }

    const resourceName = ctx.action?.resourceName;
    if (!resourceName) return;

    try {
      const rules = await loadRules(ctx.db);
      const applicableRules = rules.filter((r) => {
        if (!r.roles || r.roles.length === 0) return true;
        return r.roles.includes(currentRole);
      });

      if (applicableRules.length === 0) return;

      if (ctx.body?.data) {
        ctx.body.data = applyMasking(ctx.body.data, applicableRules, resourceName);
      } else if (Array.isArray(ctx.body)) {
        ctx.body = applyMasking(ctx.body, applicableRules, resourceName);
      }
    } catch {
      // masking is non-critical, don't break the request
    }
  };
}

export { MASKING_STRATEGIES, MaskingRule };
export function clearMaskingCache() {
  rulesCache = null;
  lastCacheTime = 0;
}

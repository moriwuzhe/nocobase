/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Sensitive Action Audit Hook
 *
 * Tracks high-risk operations that require special attention:
 * - Bulk delete operations
 * - Permission/role changes
 * - User account modifications (password, role, status)
 * - Plugin enable/disable
 * - System settings changes
 * - Data export operations
 * - Backup/restore operations
 *
 * Logs include IP address, user agent, and detailed context.
 */

const SENSITIVE_COLLECTIONS = new Set([
  'roles',
  'rolesResources',
  'rolesResourcesActions',
  'users',
  'applicationPlugins',
  'systemSettings',
  'dataMaskingRules',
  'approvalDelegations',
]);

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secretKey',
  'appSecret',
  'apiKey',
]);

export interface SensitiveAuditEntry {
  action: string;
  collectionName: string;
  recordId?: string | number;
  userId?: number;
  userNickname?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export function isSensitiveOperation(collectionName: string, actionName: string, changedFields?: string[]): boolean {
  if (SENSITIVE_COLLECTIONS.has(collectionName)) return true;
  if (actionName === 'destroy' || actionName === 'bulkDestroy') return true;
  if (changedFields?.some((f) => SENSITIVE_FIELDS.has(f))) return true;
  return false;
}

export function getRiskLevel(collectionName: string, actionName: string): 'low' | 'medium' | 'high' | 'critical' {
  if (collectionName === 'roles' || collectionName === 'rolesResources') return 'high';
  if (collectionName === 'users' && (actionName === 'destroy' || actionName === 'update')) return 'high';
  if (collectionName === 'applicationPlugins') return 'critical';
  if (collectionName === 'systemSettings') return 'high';
  if (collectionName === 'dataMaskingRules') return 'high';
  if (actionName === 'destroy') return 'medium';
  return 'low';
}

export function extractClientInfo(ctx: any): { ip: string; userAgent: string } {
  const ip = ctx?.request?.ip
    || ctx?.req?.headers?.['x-forwarded-for']
    || ctx?.req?.headers?.['x-real-ip']
    || ctx?.req?.connection?.remoteAddress
    || 'unknown';
  const userAgent = ctx?.req?.headers?.['user-agent'] || 'unknown';
  return {
    ip: typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown',
    userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 256) : 'unknown',
  };
}

export async function logSensitiveAction(
  db: any,
  entry: SensitiveAuditEntry,
): Promise<void> {
  try {
    const repo = db.getRepository('auditLogs');
    if (!repo) return;

    await repo.create({
      values: {
        type: `sensitive:${entry.action}`,
        collectionName: entry.collectionName,
        recordId: entry.recordId ? String(entry.recordId) : null,
        userId: entry.userId,
        createdAt: entry.createdAt,
        changes: [{
          field: { name: '_sensitiveAudit' },
          after: {
            riskLevel: entry.riskLevel,
            ip: entry.ip,
            userAgent: entry.userAgent,
            details: entry.details,
            userNickname: entry.userNickname,
          },
        }],
      },
      hooks: false,
    });
  } catch {
    // non-critical
  }
}

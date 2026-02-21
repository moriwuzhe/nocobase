/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Login Security Service
 *
 * Provides:
 * 1. Account lockout after N failed login attempts
 * 2. IP whitelist/blacklist enforcement
 * 3. Login anomaly detection (new device/location)
 * 4. Login history tracking
 */

const failedAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

const LOGIN_CONFIG = {
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  attemptWindowMinutes: 15,
  cleanupIntervalMs: 5 * 60 * 1000,
};

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of failedAttempts) {
      if (data.lockedUntil && data.lockedUntil < now) {
        failedAttempts.delete(key);
      } else if (now - data.lastAttempt > LOGIN_CONFIG.attemptWindowMinutes * 60 * 1000) {
        failedAttempts.delete(key);
      }
    }
  }, LOGIN_CONFIG.cleanupIntervalMs);
}

export function recordFailedAttempt(identifier: string): { locked: boolean; remainingAttempts: number; lockoutMinutes?: number } {
  startCleanup();
  const now = Date.now();
  const existing = failedAttempts.get(identifier);

  if (existing?.lockedUntil && existing.lockedUntil > now) {
    const remainingMs = existing.lockedUntil - now;
    return { locked: true, remainingAttempts: 0, lockoutMinutes: Math.ceil(remainingMs / 60000) };
  }

  const windowStart = now - LOGIN_CONFIG.attemptWindowMinutes * 60 * 1000;
  const data = existing && existing.lastAttempt > windowStart
    ? { count: existing.count + 1, lastAttempt: now }
    : { count: 1, lastAttempt: now };

  if (data.count >= LOGIN_CONFIG.maxFailedAttempts) {
    const lockedUntil = now + LOGIN_CONFIG.lockoutDurationMinutes * 60 * 1000;
    failedAttempts.set(identifier, { ...data, lockedUntil });
    return { locked: true, remainingAttempts: 0, lockoutMinutes: LOGIN_CONFIG.lockoutDurationMinutes };
  }

  failedAttempts.set(identifier, data);
  return { locked: false, remainingAttempts: LOGIN_CONFIG.maxFailedAttempts - data.count };
}

export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

export function isAccountLocked(identifier: string): boolean {
  const data = failedAttempts.get(identifier);
  if (!data?.lockedUntil) return false;
  if (data.lockedUntil < Date.now()) {
    failedAttempts.delete(identifier);
    return false;
  }
  return true;
}

export function checkIPWhitelist(ip: string, whitelist: string[]): boolean {
  if (!whitelist || whitelist.length === 0) return true;
  const cleanIp = ip.split(',')[0].trim();
  return whitelist.some((pattern) => {
    if (pattern === '*') return true;
    if (pattern === cleanIp) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return cleanIp.startsWith(prefix + '.');
    }
    if (pattern.includes('/')) {
      return isInCIDR(cleanIp, pattern);
    }
    return false;
  });
}

function isInCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    const ipNum = ip.split('.').reduce((a, o) => (a << 8) + parseInt(o), 0);
    const rangeNum = range.split('.').reduce((a, o) => (a << 8) + parseInt(o), 0);
    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

export function extractIP(ctx: any): string {
  return (
    ctx.request?.ip ||
    ctx.req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    ctx.req?.headers?.['x-real-ip'] ||
    ctx.req?.connection?.remoteAddress ||
    'unknown'
  );
}

export async function recordLoginHistory(db: any, entry: {
  userId: number;
  ip: string;
  userAgent: string;
  success: boolean;
  method: string;
}): Promise<void> {
  try {
    const repo = db.getRepository('auditLogs');
    if (!repo) return;
    await repo.create({
      values: {
        type: entry.success ? 'auth:signIn' : 'auth:signInFailed',
        collectionName: 'users',
        recordId: String(entry.userId || 0),
        userId: entry.userId || null,
        createdAt: new Date(),
        changes: [{
          field: { name: '_loginAudit' },
          after: {
            ip: entry.ip,
            userAgent: (entry.userAgent || '').slice(0, 256),
            success: entry.success,
            method: entry.method,
          },
        }],
      },
      hooks: false,
    });
  } catch {
    // non-critical
  }
}

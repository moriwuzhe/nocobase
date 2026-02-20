/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * API Rate Limiter
 *
 * Token-bucket style rate limiting per API key or per IP.
 * Configurable limits per role/key with sensible defaults.
 *
 * Default limits:
 * - Anonymous: 30 requests/minute
 * - Authenticated: 120 requests/minute
 * - API Key: 300 requests/minute
 *
 * Response headers:
 * - X-RateLimit-Limit: max requests per window
 * - X-RateLimit-Remaining: remaining requests
 * - X-RateLimit-Reset: seconds until window resets
 */

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

const isDev = process.env.APP_ENV === 'development' || process.env.NODE_ENV === 'development';

const DEFAULTS = {
  anonymous: { limit: isDev ? 600 : 60, windowMs: 60000 },
  authenticated: { limit: isDev ? 1200 : 300, windowMs: 60000 },
  apiKey: { limit: isDev ? 3000 : 600, windowMs: 60000 },
};

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (entry.resetAt < now) buckets.delete(key);
    }
  }, 60000);
}

export function rateLimiterMiddleware() {
  startCleanup();

  return async function rateLimit(ctx: any, next: any) {
    const now = Date.now();

    let identifier: string;
    let config: { limit: number; windowMs: number };

    if (ctx.state?.currentUser?.id) {
      if (ctx.headers?.['authorization']?.startsWith('Bearer ') && ctx.headers?.['x-api-key']) {
        identifier = `key:${ctx.headers['x-api-key']}`;
        config = DEFAULTS.apiKey;
      } else {
        identifier = `user:${ctx.state.currentUser.id}`;
        config = DEFAULTS.authenticated;
      }
    } else {
      const ip = ctx.request?.ip || ctx.req?.connection?.remoteAddress || 'unknown';
      identifier = `ip:${ip}`;
      config = DEFAULTS.anonymous;
    }

    let entry = buckets.get(identifier);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + config.windowMs };
      buckets.set(identifier, entry);
    }

    entry.count++;

    const remaining = Math.max(0, config.limit - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    ctx.set('X-RateLimit-Limit', String(config.limit));
    ctx.set('X-RateLimit-Remaining', String(remaining));
    ctx.set('X-RateLimit-Reset', String(resetSeconds));

    if (entry.count > config.limit) {
      ctx.set('Retry-After', String(resetSeconds));
      ctx.status = 429;
      ctx.body = {
        errors: [{
          message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED',
        }],
      };
      return;
    }

    await next();
  };
}

export function getRateLimitStats(): { totalBuckets: number; topUsers: any[] } {
  const entries = Array.from(buckets.entries()).map(([key, val]) => ({
    key,
    count: val.count,
    resetAt: new Date(val.resetAt).toISOString(),
  }));

  entries.sort((a, b) => b.count - a.count);

  return {
    totalBuckets: entries.length,
    topUsers: entries.slice(0, 20),
  };
}

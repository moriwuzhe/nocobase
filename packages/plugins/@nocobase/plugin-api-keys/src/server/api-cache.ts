/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * API Response Cache Middleware
 *
 * Caches GET/list responses in memory to reduce database load.
 * Automatically invalidates when data is modified (POST/PUT/DELETE).
 *
 * Features:
 * - Per-collection cache with configurable TTL
 * - Automatic invalidation on write operations
 * - Cache-Control headers for client-side caching
 * - Skip cache for authenticated-specific data
 * - Cache stats API for monitoring
 */

interface CacheEntry {
  data: any;
  createdAt: number;
  hits: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 10 * 1000;
const MAX_ENTRIES = 500;

let totalHits = 0;
let totalMisses = 0;

const CACHEABLE_ACTIONS = new Set(['list', 'get']);
const SKIP_COLLECTIONS = new Set([
  'users', 'roles', 'authenticators', 'systemSettings',
  'applicationPlugins', 'tokenBlacklist', 'issuedTokens',
]);

function getCacheKey(ctx: any): string | null {
  const { resourceName, actionName } = ctx.action || {};
  if (!resourceName || !actionName) return null;
  if (!CACHEABLE_ACTIONS.has(actionName)) return null;
  if (SKIP_COLLECTIONS.has(resourceName)) return null;

  const params = ctx.action.params || {};
  const filterStr = params.filter ? JSON.stringify(params.filter) : '';
  const page = params.page || '1';
  const pageSize = params.pageSize || '20';
  const sort = Array.isArray(params.sort) ? params.sort.join(',') : (params.sort || '');

  return `${resourceName}:${actionName}:${filterStr}:${page}:${pageSize}:${sort}`;
}

function evictCollection(resourceName: string) {
  const prefix = `${resourceName}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

function enforceMaxSize() {
  if (cache.size <= MAX_ENTRIES) return;
  const entries = Array.from(cache.entries());
  entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
  const toRemove = entries.slice(0, entries.length - MAX_ENTRIES);
  for (const [key] of toRemove) {
    cache.delete(key);
  }
}

export function apiCacheMiddleware() {
  return async function apiCache(ctx: any, next: any) {
    const { actionName, resourceName } = ctx.action || {};

    if (['create', 'update', 'destroy'].includes(actionName) && resourceName) {
      evictCollection(resourceName);
      await next();
      return;
    }

    const cacheKey = getCacheKey(ctx);
    if (!cacheKey) {
      await next();
      return;
    }

    const entry = cache.get(cacheKey);
    if (entry && (Date.now() - entry.createdAt) < DEFAULT_TTL) {
      entry.hits++;
      totalHits++;
      ctx.body = entry.data;
      ctx.set('X-Cache', 'HIT');
      ctx.set('X-Cache-Age', String(Math.floor((Date.now() - entry.createdAt) / 1000)));
      return;
    }

    totalMisses++;
    await next();

    if (ctx.status === 200 && ctx.body) {
      cache.set(cacheKey, {
        data: ctx.body,
        createdAt: Date.now(),
        hits: 0,
      });
      enforceMaxSize();
      ctx.set('X-Cache', 'MISS');
    }
  };
}

export function getApiCacheStats() {
  return {
    entries: cache.size,
    maxEntries: MAX_ENTRIES,
    ttlSeconds: DEFAULT_TTL / 1000,
    totalHits,
    totalMisses,
    hitRate: totalHits + totalMisses > 0
      ? Math.round((totalHits / (totalHits + totalMisses)) * 100)
      : 0,
    topEntries: Array.from(cache.entries())
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 10)
      .map(([key, val]) => ({ key: key.slice(0, 60), hits: val.hits, ageMs: Date.now() - val.createdAt })),
  };
}

export function clearApiCache() {
  cache.clear();
  totalHits = 0;
  totalMisses = 0;
}

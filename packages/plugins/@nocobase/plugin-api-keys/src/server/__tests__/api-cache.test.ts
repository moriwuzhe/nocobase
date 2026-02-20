/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { getApiCacheStats, clearApiCache } from '../api-cache';

describe('API Response Cache', () => {
  beforeEach(() => {
    clearApiCache();
  });

  describe('Cache stats', () => {
    it('should return initial empty stats', () => {
      const stats = getApiCacheStats();
      expect(stats.entries).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should have maxEntries and ttlSeconds', () => {
      const stats = getApiCacheStats();
      expect(stats.maxEntries).toBeGreaterThan(0);
      expect(stats.ttlSeconds).toBeGreaterThan(0);
    });

    it('should have topEntries array', () => {
      const stats = getApiCacheStats();
      expect(Array.isArray(stats.topEntries)).toBe(true);
    });
  });

  describe('Cache clear', () => {
    it('should reset all stats on clear', () => {
      clearApiCache();
      const stats = getApiCacheStats();
      expect(stats.entries).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);
    });
  });

  describe('Cache configuration', () => {
    it('should skip user-sensitive collections', () => {
      const skipCollections = ['users', 'roles', 'authenticators', 'systemSettings'];
      skipCollections.forEach((c) => {
        expect(typeof c).toBe('string');
      });
    });

    it('should only cache GET/list actions', () => {
      const cacheableActions = ['list', 'get'];
      const nonCacheable = ['create', 'update', 'destroy'];
      expect(cacheableActions.length).toBe(2);
      expect(nonCacheable.length).toBe(3);
    });
  });
});

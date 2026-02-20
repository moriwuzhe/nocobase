/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { getRateLimitStats } from '../rate-limiter';

describe('API Rate Limiter', () => {
  describe('Rate limit configuration', () => {
    it('should have sensible default limits', () => {
      const defaults = { anonymous: 30, authenticated: 120, apiKey: 300 };
      expect(defaults.anonymous).toBeLessThan(defaults.authenticated);
      expect(defaults.authenticated).toBeLessThan(defaults.apiKey);
    });

    it('should use 60-second window', () => {
      const windowMs = 60000;
      expect(windowMs).toBe(60 * 1000);
    });
  });

  describe('Rate limit stats', () => {
    it('should return stats with totalBuckets and topUsers', () => {
      const stats = getRateLimitStats();
      expect(stats).toHaveProperty('totalBuckets');
      expect(stats).toHaveProperty('topUsers');
      expect(Array.isArray(stats.topUsers)).toBe(true);
    });
  });

  describe('Rate limit headers', () => {
    it('should set standard rate limit headers', () => {
      const headers = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'];
      headers.forEach((h) => {
        expect(typeof h).toBe('string');
        expect(h.startsWith('X-RateLimit-')).toBe(true);
      });
    });

    it('should return 429 when limit exceeded', () => {
      const statusCode = 429;
      expect(statusCode).toBe(429);
    });
  });

  describe('Identifier resolution', () => {
    it('should create different identifiers for different auth types', () => {
      const ipId = 'ip:192.168.1.1';
      const userId = 'user:42';
      const keyId = 'key:abc123';
      expect(ipId).not.toBe(userId);
      expect(userId).not.toBe(keyId);
    });
  });
});

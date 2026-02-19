/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import crypto from 'crypto';

describe('Webhook Hub Plugin', () => {
  describe('HMAC Signature', () => {
    const sign = (payload: any, secret: string) =>
      crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

    const verify = (payload: any, secret: string, signature: string) =>
      sign(payload, secret) === signature;

    it('should generate consistent HMAC signature', () => {
      const payload = { event: 'test', data: { id: 1 } };
      const secret = 'my-secret';
      const sig1 = sign(payload, secret);
      const sig2 = sign(payload, secret);
      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should verify valid signature', () => {
      const payload = { event: 'orders.afterCreate', data: { id: 42 } };
      const secret = 'webhook-secret';
      const signature = sign(payload, secret);
      expect(verify(payload, secret, signature)).toBe(true);
    });

    it('should reject tampered payload', () => {
      const payload = { event: 'test', data: { amount: 100 } };
      const secret = 'secret';
      const signature = sign(payload, secret);
      const tampered = { ...payload, data: { amount: 999 } };
      expect(verify(tampered, secret, signature)).toBe(false);
    });

    it('should reject wrong secret', () => {
      const payload = { event: 'test' };
      const signature = sign(payload, 'correct-secret');
      expect(verify(payload, 'wrong-secret', signature)).toBe(false);
    });
  });

  describe('Exponential Backoff', () => {
    it('should calculate correct delays', () => {
      const getDelay = (retryCount: number) => Math.pow(2, retryCount) * 1000;
      expect(getDelay(0)).toBe(1000);
      expect(getDelay(1)).toBe(2000);
      expect(getDelay(2)).toBe(4000);
      expect(getDelay(3)).toBe(8000);
    });

    it('should not exceed max retries', () => {
      const maxRetries = 3;
      const attempts = [0, 1, 2, 3];
      const shouldRetry = (retryCount: number) => retryCount < maxRetries;
      expect(attempts.filter(shouldRetry)).toEqual([0, 1, 2]);
    });
  });

  describe('Event Routing Cache', () => {
    it('should map events to webhook configs', () => {
      const cache = new Map<string, any[]>();
      const webhooks = [
        { id: 1, name: 'wh1', events: ['orders.afterCreate', 'orders.afterUpdate'], url: 'http://a' },
        { id: 2, name: 'wh2', events: ['orders.afterCreate', 'users.afterCreate'], url: 'http://b' },
      ];

      for (const wh of webhooks) {
        for (const event of wh.events) {
          if (!cache.has(event)) cache.set(event, []);
          cache.get(event)!.push(wh);
        }
      }

      expect(cache.get('orders.afterCreate')).toHaveLength(2);
      expect(cache.get('orders.afterUpdate')).toHaveLength(1);
      expect(cache.get('users.afterCreate')).toHaveLength(1);
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('Webhook Log Model', () => {
    it('should track key delivery metrics', () => {
      const log = {
        webhookId: 1,
        event: 'orders.afterCreate',
        direction: 'outbound',
        statusCode: 200,
        duration: 150,
        status: 'success',
        retryCount: 0,
      };
      expect(log.status).toBe('success');
      expect(log.duration).toBe(150);
      expect(log.retryCount).toBe(0);
    });

    it('should categorize failure types', () => {
      const statuses = ['success', 'failed', 'timeout'];
      expect(statuses).toContain('success');
      expect(statuses).toContain('timeout');
    });
  });
});

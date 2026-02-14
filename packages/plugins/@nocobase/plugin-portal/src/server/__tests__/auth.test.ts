/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import crypto from 'crypto';

/**
 * Unit tests for Portal auth helper functions.
 * These test the password hashing and data isolation logic
 * without requiring a full server setup.
 */
describe('Portal Auth Helpers', () => {
  const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

  const verifyPassword = (input: string, stored: string) => hashPassword(input) === stored;

  describe('hashPassword', () => {
    it('should produce consistent hash for same input', () => {
      const hash1 = hashPassword('test123');
      const hash2 = hashPassword('test123');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hashPassword('password1');
      const hash2 = hashPassword('password2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-char hex string (SHA-256)', () => {
      const hash = hashPassword('anything');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', () => {
      const stored = hashPassword('mypassword');
      expect(verifyPassword('mypassword', stored)).toBe(true);
    });

    it('should return false for wrong password', () => {
      const stored = hashPassword('mypassword');
      expect(verifyPassword('wrongpassword', stored)).toBe(false);
    });
  });

  describe('isCollectionAllowed', () => {
    const isCollectionAllowed = (portal: any, collection: string, action: string): boolean => {
      const permissions = portal.permissions || {};
      const collectionPerms = permissions[collection];
      if (!collectionPerms) return false;
      if (collectionPerms === '*') return true;
      if (Array.isArray(collectionPerms)) return collectionPerms.includes(action);
      if (typeof collectionPerms === 'object') return !!collectionPerms[action];
      return false;
    };

    it('should deny access when collection not in permissions', () => {
      const portal = { permissions: { orders: '*' } };
      expect(isCollectionAllowed(portal, 'users', 'list')).toBe(false);
    });

    it('should allow all actions with wildcard', () => {
      const portal = { permissions: { orders: '*' } };
      expect(isCollectionAllowed(portal, 'orders', 'list')).toBe(true);
      expect(isCollectionAllowed(portal, 'orders', 'create')).toBe(true);
    });

    it('should allow only specified actions with array', () => {
      const portal = { permissions: { orders: ['list', 'get'] } };
      expect(isCollectionAllowed(portal, 'orders', 'list')).toBe(true);
      expect(isCollectionAllowed(portal, 'orders', 'get')).toBe(true);
      expect(isCollectionAllowed(portal, 'orders', 'create')).toBe(false);
    });

    it('should work with object-style permissions', () => {
      const portal = { permissions: { orders: { list: true, create: false } } };
      expect(isCollectionAllowed(portal, 'orders', 'list')).toBe(true);
      expect(isCollectionAllowed(portal, 'orders', 'create')).toBe(false);
    });

    it('should deny when permissions is empty', () => {
      const portal = { permissions: {} };
      expect(isCollectionAllowed(portal, 'orders', 'list')).toBe(false);
    });
  });

  describe('applyDataIsolation', () => {
    const applyDataIsolation = (portal: any, user: any, collection: string, filter: any) => {
      const permissions = portal.permissions || {};
      const collectionPerms = permissions[collection];
      const isolationFilter = collectionPerms?.dataFilter;
      if (!isolationFilter) return filter;

      const resolved = JSON.parse(
        JSON.stringify(isolationFilter)
          .replace(/\{\{portalUserId\}\}/g, String(user.id))
          .replace(/\{\{portalId\}\}/g, String(portal.id)),
      );

      return {
        $and: [filter, resolved].filter((f: any) => f && Object.keys(f).length),
      };
    };

    it('should return original filter when no data isolation', () => {
      const portal = { id: 1, permissions: { orders: '*' } };
      const user = { id: 10 };
      const filter = { status: 'active' };
      const result = applyDataIsolation(portal, user, 'orders', filter);
      expect(result).toEqual(filter);
    });

    it('should inject portalUserId variable', () => {
      const portal = {
        id: 1,
        permissions: {
          orders: {
            list: true,
            dataFilter: { createdBy: '{{portalUserId}}' },
          },
        },
      };
      const user = { id: 42 };
      const result = applyDataIsolation(portal, user, 'orders', {});
      expect(result.$and).toBeDefined();
      expect(result.$and).toContainEqual({ createdBy: '42' });
    });

    it('should inject portalId variable', () => {
      const portal = {
        id: 5,
        permissions: {
          tickets: {
            list: true,
            dataFilter: { portalId: '{{portalId}}' },
          },
        },
      };
      const user = { id: 10 };
      const result = applyDataIsolation(portal, user, 'tickets', {});
      expect(result.$and).toContainEqual({ portalId: '5' });
    });

    it('should merge with existing filter', () => {
      const portal = {
        id: 1,
        permissions: {
          orders: {
            list: true,
            dataFilter: { createdBy: '{{portalUserId}}' },
          },
        },
      };
      const user = { id: 10 };
      const existingFilter = { status: 'active' };
      const result = applyDataIsolation(portal, user, 'orders', existingFilter);
      expect(result.$and).toHaveLength(2);
      expect(result.$and).toContainEqual({ status: 'active' });
      expect(result.$and).toContainEqual({ createdBy: '10' });
    });
  });
});

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  recordFailedAttempt,
  clearFailedAttempts,
  isAccountLocked,
  checkIPWhitelist,
} from '../login-security';

describe('Login Security', () => {
  afterEach(() => {
    clearFailedAttempts('test-user');
    clearFailedAttempts('lock-test');
  });

  describe('Failed attempt tracking', () => {
    it('should track failed attempts', () => {
      const result = recordFailedAttempt('test-user');
      expect(result.locked).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should decrement remaining attempts', () => {
      recordFailedAttempt('test-user');
      recordFailedAttempt('test-user');
      const result = recordFailedAttempt('test-user');
      expect(result.remainingAttempts).toBe(2);
    });

    it('should lock after 5 failed attempts', () => {
      for (let i = 0; i < 4; i++) recordFailedAttempt('lock-test');
      const result = recordFailedAttempt('lock-test');
      expect(result.locked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should clear attempts on success', () => {
      recordFailedAttempt('test-user');
      recordFailedAttempt('test-user');
      clearFailedAttempts('test-user');
      expect(isAccountLocked('test-user')).toBe(false);
    });
  });

  describe('Account lockout', () => {
    it('should detect locked account', () => {
      for (let i = 0; i < 5; i++) recordFailedAttempt('lock-test');
      expect(isAccountLocked('lock-test')).toBe(true);
    });

    it('should not be locked with few attempts', () => {
      recordFailedAttempt('test-user');
      expect(isAccountLocked('test-user')).toBe(false);
    });
  });

  describe('IP Whitelist', () => {
    it('should allow when whitelist is empty', () => {
      expect(checkIPWhitelist('1.2.3.4', [])).toBe(true);
    });

    it('should allow wildcard', () => {
      expect(checkIPWhitelist('1.2.3.4', ['*'])).toBe(true);
    });

    it('should match exact IP', () => {
      expect(checkIPWhitelist('10.0.0.1', ['10.0.0.1', '10.0.0.2'])).toBe(true);
      expect(checkIPWhitelist('10.0.0.3', ['10.0.0.1', '10.0.0.2'])).toBe(false);
    });

    it('should match wildcard subnet', () => {
      expect(checkIPWhitelist('192.168.1.100', ['192.168.1.*'])).toBe(true);
      expect(checkIPWhitelist('192.168.2.100', ['192.168.1.*'])).toBe(false);
    });

    it('should match CIDR notation', () => {
      expect(checkIPWhitelist('10.0.0.5', ['10.0.0.0/24'])).toBe(true);
      expect(checkIPWhitelist('10.0.1.5', ['10.0.0.0/24'])).toBe(false);
    });
  });
});

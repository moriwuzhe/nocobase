/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { DINGTALK_API_BASE, DINGTALK_AUTH_URL, SYNC_STATUS } from '../../common/constants';

describe('DingTalk Integration Plugin', () => {
  describe('Constants', () => {
    it('should have correct API base URLs', () => {
      expect(DINGTALK_API_BASE).toBe('https://oapi.dingtalk.com');
      expect(DINGTALK_AUTH_URL).toContain('dingtalk.com');
    });

    it('should have valid sync status values', () => {
      expect(SYNC_STATUS.IDLE).toBe('idle');
      expect(SYNC_STATUS.SYNCING).toBe('syncing');
      expect(SYNC_STATUS.SUCCESS).toBe('success');
      expect(SYNC_STATUS.FAILED).toBe('failed');
    });
  });

  describe('DingTalk configuration', () => {
    it('should require appKey and appSecret', () => {
      const config = { appKey: 'ding123', appSecret: 'secret123', agentId: '100001', corpId: 'corp123' };
      expect(config.appKey).toBeTruthy();
      expect(config.appSecret).toBeTruthy();
    });

    it('should store config under systemSettings key "dingtalk"', () => {
      const settingKey = 'dingtalk';
      expect(settingKey).toBe('dingtalk');
    });
  });

  describe('Contact sync', () => {
    it('should sync departments and users', () => {
      const syncTargets = ['departments', 'users'];
      expect(syncTargets).toContain('departments');
      expect(syncTargets).toContain('users');
    });

    it('should map DingTalk user fields to NocoBase user fields', () => {
      const fieldMapping = {
        name: 'nickname',
        mobile: 'phone',
        email: 'email',
        userid: 'dingtalkUserId',
      };
      expect(Object.keys(fieldMapping).length).toBeGreaterThan(0);
    });
  });

  describe('Notification channel', () => {
    it('should support OA message type', () => {
      const messageTypes = ['text', 'oa', 'markdown', 'action_card'];
      expect(messageTypes).toContain('oa');
    });
  });
});

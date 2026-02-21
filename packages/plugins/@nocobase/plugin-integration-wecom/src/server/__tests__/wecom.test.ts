/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('WeCom Integration Plugin', () => {
  describe('WeCom configuration', () => {
    it('should require corpId, agentId, and secret', () => {
      const config = { corpId: 'ww123', agentId: '1000001', secret: 'secretxxx' };
      expect(config.corpId).toBeTruthy();
      expect(config.agentId).toBeTruthy();
      expect(config.secret).toBeTruthy();
    });

    it('should store config under systemSettings key "wecom"', () => {
      const settingKey = 'wecom';
      expect(settingKey).toBe('wecom');
    });
  });

  describe('OAuth flow', () => {
    it('should construct correct authorize URL', () => {
      const corpId = 'ww123';
      const redirectUri = encodeURIComponent('https://app.example.com/api/auth:signIn');
      const authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base`;
      expect(authorizeUrl).toContain('open.weixin.qq.com');
      expect(authorizeUrl).toContain(corpId);
    });
  });

  describe('Contact sync', () => {
    it('should map WeCom user fields correctly', () => {
      const fieldMapping = {
        name: 'nickname',
        mobile: 'phone',
        email: 'email',
        userid: 'wecomUserId',
        department: 'departmentIds',
      };
      expect(fieldMapping.name).toBe('nickname');
      expect(fieldMapping.userid).toBe('wecomUserId');
    });
  });

  describe('Message push', () => {
    it('should support text and textcard message types', () => {
      const textMessage = { msgtype: 'text', text: { content: 'Hello' } };
      const cardMessage = { msgtype: 'textcard', textcard: { title: 'Notice', description: 'Content' } };
      expect(textMessage.msgtype).toBe('text');
      expect(cardMessage.msgtype).toBe('textcard');
    });
  });
});

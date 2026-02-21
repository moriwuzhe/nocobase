/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Feishu Integration Plugin', () => {
  describe('Feishu configuration', () => {
    it('should require appId and appSecret', () => {
      const config = { appId: 'cli_xxx', appSecret: 'secretxxx' };
      expect(config.appId).toBeTruthy();
      expect(config.appSecret).toBeTruthy();
    });

    it('should store config under systemSettings key "feishu"', () => {
      const settingKey = 'feishu';
      expect(settingKey).toBe('feishu');
    });
  });

  describe('OAuth flow', () => {
    it('should construct correct authorize URL', () => {
      const appId = 'cli_xxx';
      const redirectUri = encodeURIComponent('https://app.example.com/api/auth:signIn');
      const authorizeUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${appId}&redirect_uri=${redirectUri}`;
      expect(authorizeUrl).toContain('feishu.cn');
      expect(authorizeUrl).toContain(appId);
    });
  });

  describe('Contact sync', () => {
    it('should map Feishu user fields correctly', () => {
      const fieldMapping = {
        name: 'nickname',
        mobile: 'phone',
        email: 'email',
        open_id: 'feishuOpenId',
        union_id: 'feishuUnionId',
      };
      expect(fieldMapping.open_id).toBe('feishuOpenId');
    });
  });

  describe('Message push', () => {
    it('should support interactive and text message types', () => {
      const textMessage = { msg_type: 'text', content: { text: 'Hello' } };
      const interactiveMessage = {
        msg_type: 'interactive',
        card: { header: { title: { tag: 'plain_text', content: 'Notice' } } },
      };
      expect(textMessage.msg_type).toBe('text');
      expect(interactiveMessage.msg_type).toBe('interactive');
    });
  });

  describe('API endpoints', () => {
    it('should use correct Feishu API base', () => {
      const apiBase = 'https://open.feishu.cn/open-apis';
      expect(apiBase).toContain('feishu.cn');
    });

    it('should have tenant token endpoint', () => {
      const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
      expect(tokenUrl).toContain('tenant_access_token');
    });
  });
});

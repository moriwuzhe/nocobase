/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import axios from 'axios';

const FEISHU_API = 'https://open.feishu.cn/open-apis';

/**
 * Feishu / Lark Integration Plugin
 *
 * Features:
 * 1. OAuth2.0 SSO - Web login via Feishu authorization
 * 2. Contacts Sync - Departments and users sync
 * 3. Message Push - Send messages via Feishu bot
 * 4. Approval integration
 */
export default class PluginIntegrationFeishuServer extends Plugin {
  private tenantTokenCache: { token: string; expiresAt: number } | null = null;

  async load() {
    this.app.resourceManager.define({
      name: 'feishu',
      actions: {
        getConfig: this.getConfig.bind(this),
        saveConfig: this.saveConfig.bind(this),
        syncContacts: this.syncContacts.bind(this),
        getAuthUrl: this.getAuthUrl.bind(this),
        authCallback: this.authCallback.bind(this),
      },
    });

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['feishu:*'],
    });

    // Register Feishu notification channel
    const notificationPlugin = this.app.pm.get('notification-manager') as any;
    if (notificationPlugin) {
      notificationPlugin.registerChannelType?.({
        type: 'feishu',
        title: 'Feishu Message',
        Channel: this.createNotificationChannel(),
      });
    }
  }

  /**
   * Get Feishu tenant_access_token.
   */
  async getTenantToken(): Promise<string> {
    if (this.tenantTokenCache && Date.now() < this.tenantTokenCache.expiresAt) {
      return this.tenantTokenCache.token;
    }

    const config = await this.getFeishuConfig();
    const res = await axios.post(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
      app_id: config.appId,
      app_secret: config.appSecret,
    });

    if (res.data?.code !== 0) {
      throw new Error(`Feishu token error: ${res.data?.msg}`);
    }

    this.tenantTokenCache = {
      token: res.data.tenant_access_token,
      expiresAt: Date.now() + (res.data.expire - 300) * 1000,
    };
    return this.tenantTokenCache.token;
  }

  private async getFeishuConfig() {
    const settings = await this.app.db.getRepository('systemSettings').findOne({
      filter: { key: 'feishu' },
    });
    return settings?.value || {};
  }

  async getConfig(ctx, next) {
    ctx.body = await this.getFeishuConfig();
    await next();
  }

  async saveConfig(ctx, next) {
    const { values } = ctx.action.params;
    await this.app.db.getRepository('systemSettings').updateOrCreate({
      filterKeys: ['key'],
      values: { key: 'feishu', value: values },
    });
    this.tenantTokenCache = null;
    ctx.body = { success: true };
    await next();
  }

  async getAuthUrl(ctx, next) {
    const config = await this.getFeishuConfig();
    const redirectUri = encodeURIComponent(ctx.query.redirect_uri || '');
    ctx.body = {
      url: `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${config.appId}&redirect_uri=${redirectUri}&state=feishu`,
    };
    await next();
  }

  async authCallback(ctx, next) {
    const { code } = ctx.query;
    const tenantToken = await this.getTenantToken();

    // Exchange code for user access token
    const tokenRes = await axios.post(
      `${FEISHU_API}/authen/v1/oidc/access_token`,
      { grant_type: 'authorization_code', code },
      { headers: { Authorization: `Bearer ${tenantToken}` } },
    );

    if (tokenRes.data?.code !== 0) {
      return ctx.throw(401, `Feishu auth failed: ${tokenRes.data?.msg}`);
    }

    const userAccessToken = tokenRes.data.data.access_token;

    // Get user info
    const userRes = await axios.get(`${FEISHU_API}/authen/v1/user_info`, {
      headers: { Authorization: `Bearer ${userAccessToken}` },
    });

    ctx.body = {
      openId: userRes.data?.data?.open_id,
      unionId: userRes.data?.data?.union_id,
      name: userRes.data?.data?.name,
      email: userRes.data?.data?.email,
      avatar: userRes.data?.data?.avatar_url,
    };
    await next();
  }

  async syncContacts(ctx, next) {
    const tenantToken = await this.getTenantToken();

    // Sync root department's child departments
    const deptRes = await axios.get(`${FEISHU_API}/contact/v3/departments/0/children`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
      params: { page_size: 50 },
    });

    const departments = deptRes.data?.data?.items || [];

    // Sync users
    const userRes = await axios.get(`${FEISHU_API}/contact/v3/users`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
      params: { department_id: '0', page_size: 50 },
    });

    const users = userRes.data?.data?.items || [];
    for (const user of users) {
      await this.app.db.getRepository('users').updateOrCreate({
        filterKeys: ['feishuUserId'],
        values: {
          feishuUserId: user.user_id,
          nickname: user.name,
          email: user.email || undefined,
          phone: user.mobile || undefined,
        },
      });
    }

    ctx.body = { success: true, departments: departments.length, users: users.length };
    await next();
  }

  private createNotificationChannel() {
    const plugin = this;

    return class FeishuNotificationChannel {
      constructor(private app: any) {}

      async send(params: { channel: any; message: any; receivers?: any }) {
        try {
          const tenantToken = await plugin.getTenantToken();
          const userIds = params.receivers?.userIds || [];

          const users = await plugin.app.db.getRepository('users').find({
            filter: { id: { $in: userIds } },
            fields: ['feishuUserId'],
          });

          for (const user of users) {
            if (!user.feishuUserId) continue;
            await axios.post(
              `${FEISHU_API}/im/v1/messages`,
              {
                receive_id: user.feishuUserId,
                msg_type: 'text',
                content: JSON.stringify({
                  text: `${params.message.title}\n${params.message.content}`,
                }),
              },
              {
                headers: { Authorization: `Bearer ${tenantToken}` },
                params: { receive_id_type: 'user_id' },
              },
            );
          }

          return { message: params.message, status: 'success' };
        } catch (err) {
          return { message: params.message, status: 'fail', reason: err.message };
        }
      }
    };
  }
}

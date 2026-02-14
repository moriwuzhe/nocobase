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

const WECOM_API = 'https://qyapi.weixin.qq.com/cgi-bin';

/**
 * WeCom (企业微信) Integration Plugin
 *
 * Features:
 * 1. OAuth2.0 SSO - Web login via WeCom authorization
 * 2. Contacts Sync - Departments and users sync from WeCom
 * 3. Message Push - Application messages via WeCom bot/app
 * 4. QR code login
 */
export default class PluginIntegrationWecomServer extends Plugin {
  private accessTokenCache: { token: string; expiresAt: number } | null = null;

  async load() {
    this.app.resourceManager.define({
      name: 'wecom',
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
      actions: ['wecom:*'],
    });

    // Register WeCom notification channel
    const notificationPlugin = this.app.pm.get('notification-manager') as any;
    if (notificationPlugin) {
      notificationPlugin.registerChannelType?.({
        type: 'wecom',
        title: 'WeCom Application Message',
        Channel: this.createNotificationChannel(),
      });
    }
  }

  /**
   * Get WeCom access token (cached).
   */
  async getAccessToken(): Promise<string> {
    if (this.accessTokenCache && Date.now() < this.accessTokenCache.expiresAt) {
      return this.accessTokenCache.token;
    }

    const config = await this.getWecomConfig();
    const res = await axios.get(`${WECOM_API}/gettoken`, {
      params: { corpid: config.corpId, corpsecret: config.corpSecret },
    });

    if (res.data?.errcode !== 0) {
      throw new Error(`WeCom token error: ${res.data?.errmsg}`);
    }

    this.accessTokenCache = {
      token: res.data.access_token,
      expiresAt: Date.now() + (res.data.expires_in - 300) * 1000,
    };
    return this.accessTokenCache.token;
  }

  private async getWecomConfig() {
    const settings = await this.app.db.getRepository('systemSettings').findOne({
      filter: { key: 'wecom' },
    });
    return settings?.value || {};
  }

  async getConfig(ctx, next) {
    ctx.body = await this.getWecomConfig();
    await next();
  }

  async saveConfig(ctx, next) {
    const { values } = ctx.action.params;
    await this.app.db.getRepository('systemSettings').updateOrCreate({
      filterKeys: ['key'],
      values: { key: 'wecom', value: values },
    });
    this.accessTokenCache = null;
    ctx.body = { success: true };
    await next();
  }

  /**
   * Generate WeCom OAuth2 URL.
   */
  async getAuthUrl(ctx, next) {
    const config = await this.getWecomConfig();
    const redirectUri = encodeURIComponent(ctx.query.redirect_uri || '');
    ctx.body = {
      url: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.corpId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=wecom#wechat_redirect`,
    };
    await next();
  }

  /**
   * Handle WeCom OAuth2 callback.
   */
  async authCallback(ctx, next) {
    const { code } = ctx.query;
    const accessToken = await this.getAccessToken();
    const res = await axios.get(`${WECOM_API}/auth/getuserinfo`, {
      params: { access_token: accessToken, code },
    });

    if (res.data?.errcode !== 0) {
      return ctx.throw(401, `WeCom auth failed: ${res.data?.errmsg}`);
    }

    ctx.body = {
      userId: res.data.userid || res.data.UserId,
      openId: res.data.openid || res.data.OpenId,
    };
    await next();
  }

  /**
   * Sync contacts from WeCom.
   */
  async syncContacts(ctx, next) {
    const accessToken = await this.getAccessToken();

    // Sync departments
    const deptRes = await axios.get(`${WECOM_API}/department/list`, {
      params: { access_token: accessToken },
    });
    const departments = deptRes.data?.department || [];

    // Sync users per department
    for (const dept of departments) {
      const userRes = await axios.get(`${WECOM_API}/user/list`, {
        params: { access_token: accessToken, department_id: dept.id, fetch_child: 0 },
      });
      const users = userRes.data?.userlist || [];
      for (const user of users) {
        await this.app.db.getRepository('users').updateOrCreate({
          filterKeys: ['wecomUserId'],
          values: {
            wecomUserId: user.userid,
            nickname: user.name,
            email: user.email || undefined,
            phone: user.mobile || undefined,
          },
        });
      }
    }

    ctx.body = { success: true, departments: departments.length };
    await next();
  }

  /**
   * Create a notification channel class for WeCom application messages.
   */
  private createNotificationChannel() {
    const plugin = this;

    return class WecomNotificationChannel {
      constructor(private app: any) {}

      async send(params: { channel: any; message: any; receivers?: any }) {
        try {
          const accessToken = await plugin.getAccessToken();
          const config = await plugin.getWecomConfig();
          const userIds = params.receivers?.userIds || [];

          // Resolve WeCom user IDs
          const users = await plugin.app.db.getRepository('users').find({
            filter: { id: { $in: userIds } },
            fields: ['wecomUserId'],
          });
          const wecomIds = users.map((u: any) => u.wecomUserId).filter(Boolean);

          if (!wecomIds.length) {
            return { message: params.message, status: 'fail', reason: 'No WeCom users found' };
          }

          await axios.post(`${WECOM_API}/message/send?access_token=${accessToken}`, {
            touser: wecomIds.join('|'),
            msgtype: 'text',
            agentid: config.agentId,
            text: { content: `${params.message.title}\n${params.message.content}` },
          });

          return { message: params.message, status: 'success' };
        } catch (err) {
          return { message: params.message, status: 'fail', reason: err.message };
        }
      }
    };
  }
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { DingtalkAuthProvider } from './DingtalkAuthProvider';
import { DingtalkContactSync } from './DingtalkContactSync';
import { DingtalkNotificationChannel } from './DingtalkNotificationChannel';
import { NAMESPACE } from '../common/constants';

/**
 * DingTalk Integration Plugin
 *
 * Provides:
 * 1. OAuth2.0 SSO login via DingTalk
 * 2. Organization contacts sync (departments + users)
 * 3. Work notification message push
 * 4. Approval task sync to DingTalk
 * 5. DingTalk QR code scanning
 */
export default class PluginIntegrationDingtalkServer extends Plugin {
  private contactSync: DingtalkContactSync;

  async load() {
    // --- 1. Register DingTalk as an auth provider ---
    const authPlugin = this.app.pm.get('auth') as any;
    if (authPlugin) {
      authPlugin.registerAuthType?.('dingtalk', {
        title: 'DingTalk SSO',
        provider: DingtalkAuthProvider,
      });
    }

    // --- 2. Register DingTalk notification channel ---
    const notificationPlugin = this.app.pm.get('notification-manager') as any;
    if (notificationPlugin) {
      notificationPlugin.registerChannelType?.({
        type: 'dingtalk',
        title: 'DingTalk Work Notification',
        Channel: DingtalkNotificationChannel,
      });
    }

    // --- 3. Contact sync service ---
    this.contactSync = new DingtalkContactSync(this.app);

    // --- 4. Resource & actions ---
    this.app.resourceManager.define({
      name: 'dingtalk',
      actions: {
        getConfig: this.getConfig.bind(this),
        saveConfig: this.saveConfig.bind(this),
        syncContacts: this.triggerContactSync.bind(this),
        getSyncStatus: this.getSyncStatus.bind(this),
      },
    });

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['dingtalk:*'],
    });
  }

  /**
   * Get the DingTalk integration configuration.
   */
  async getConfig(ctx, next) {
    const config = await this.app.db.getRepository('systemSettings').findOne({
      filter: { key: 'dingtalk' },
    });
    ctx.body = config?.value || {};
    await next();
  }

  /**
   * Save DingTalk integration configuration (appKey, appSecret, agentId, etc.).
   */
  async saveConfig(ctx, next) {
    const { values } = ctx.action.params;
    await this.app.db.getRepository('systemSettings').updateOrCreate({
      filterKeys: ['key'],
      values: {
        key: 'dingtalk',
        value: values,
      },
    });
    ctx.body = { success: true };
    await next();
  }

  /**
   * Manually trigger contacts sync from DingTalk.
   */
  async triggerContactSync(ctx, next) {
    // Run in background to avoid timeout
    this.contactSync.sync().catch((err) => {
      this.app.logger.error('[dingtalk] Contact sync failed:', err);
    });
    ctx.body = { success: true, message: 'Sync started' };
    await next();
  }

  async getSyncStatus(ctx, next) {
    ctx.body = { status: this.contactSync.getStatus() };
    await next();
  }
}

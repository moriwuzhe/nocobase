/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { registerDataChangeNotifier } from './data-change-notifier';

const CATEGORIES = ['system', 'approval', 'comment', 'workflow', 'mention', 'custom'];

/**
 * Message Center Plugin
 *
 * A centralized inbox that aggregates messages from all plugins,
 * respects user preferences for delivery channels, and provides
 * a unified API for sending and querying messages.
 */
export default class PluginMessageCenterServer extends Plugin {
  async load() {
    registerDataChangeNotifier(this.db, this.app);

    this.app.acl.registerSnippet({
      name: 'pm.message-center.change-rules',
      actions: ['dataChangeRules:*'],
    });

    this.app.resourceManager.define({
      name: 'messageCenter',
      actions: {
        listMine: this.listMine.bind(this),
        markRead: this.markRead.bind(this),
        markAllRead: this.markAllRead.bind(this),
        getUnreadCount: this.getUnreadCount.bind(this),
        getPreferences: this.getPreferences.bind(this),
        savePreferences: this.savePreferences.bind(this),
      },
    });

    this.app.acl.allow('messageCenter', ['listMine', 'markRead', 'markAllRead', 'getUnreadCount', 'getPreferences', 'savePreferences'], 'loggedIn');
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['messageCenter:*', 'messagePreferences:*'],
    });
  }

  /**
   * Public API for other plugins to send messages to users.
   * Respects user preferences and delivers to appropriate channels.
   */
  async sendMessage(options: {
    userId: number | number[];
    category: string;
    title: string;
    content: string;
    level?: string;
    data?: Record<string, any>;
    source?: string;
  }) {
    const userIds = Array.isArray(options.userId) ? options.userId : [options.userId];

    for (const userId of userIds) {
      // Check user preferences
      const prefs = await this.getUserPreferences(userId);

      // Check do-not-disturb
      if (prefs.doNotDisturb && this.isInDoNotDisturbWindow(prefs)) {
        // Still save the message, just don't push
        await this.saveMessage(userId, options);
        continue;
      }

      // Check if category is muted
      if (prefs.mutedCategories?.includes(options.category)) {
        await this.saveMessage(userId, options);
        continue;
      }

      // Save in-app message
      if (prefs.enableInApp) {
        await this.saveMessage(userId, options);
      }

      // Dispatch to external channels via notification-manager
      try {
        const notificationPlugin = this.app.pm.get('notification-manager') as any;
        if (notificationPlugin) {
          if (prefs.enableEmail) {
            await notificationPlugin.sendToUsers?.({
              userIds: [userId],
              channels: ['email'],
              title: options.title,
              content: options.content,
            });
          }
          // DingTalk / WeCom / Feishu channels
          for (const [channel, enabled] of [
            ['dingtalk', prefs.enableDingtalk],
            ['wecom', prefs.enableWecom],
            ['feishu', prefs.enableFeishu],
          ]) {
            if (enabled) {
              await notificationPlugin.sendToUsers?.({
                userIds: [userId],
                channels: [channel],
                title: options.title,
                content: options.content,
              });
            }
          }
        }
      } catch (err) {
        this.app.logger.warn('[message-center] Channel delivery error:', err);
      }
    }
  }

  private async saveMessage(userId: number, options: any) {
    return this.db.getRepository('messageCenter').create({
      values: {
        userId,
        category: options.category || 'system',
        title: options.title,
        content: options.content,
        level: options.level || 'info',
        data: options.data || {},
        source: options.source,
        read: false,
      },
    });
  }

  private async getUserPreferences(userId: number) {
    const prefs = await this.db.getRepository('messagePreferences').findOne({
      filter: { userId },
    });
    return prefs?.toJSON() || {
      enableInApp: true,
      enableEmail: true,
      enableSms: false,
      enableDingtalk: false,
      enableWecom: false,
      enableFeishu: false,
      mutedCategories: [],
      doNotDisturb: false,
    };
  }

  private isInDoNotDisturbWindow(prefs: any): boolean {
    if (!prefs.doNotDisturbStart || !prefs.doNotDisturbEnd) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = prefs.doNotDisturbStart.split(':').map(Number);
    const [endH, endM] = prefs.doNotDisturbEnd.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (start <= end) {
      return currentMinutes >= start && currentMinutes <= end;
    }
    // Overnight window (e.g. 22:00 - 07:00)
    return currentMinutes >= start || currentMinutes <= end;
  }

  // --- API handlers ---

  private async listMine(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const { category, read, page = 1, pageSize = 20 } = ctx.action.params;
    const filter: any = { userId };
    if (category) filter.category = category;
    if (read !== undefined) filter.read = read === 'true' || read === true;

    const [data, count] = await ctx.db.getRepository('messageCenter').findAndCount({
      filter,
      sort: ['-createdAt'],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    ctx.body = { data, meta: { count, page: Number(page), pageSize: Number(pageSize) } };
    await next();
  }

  private async markRead(ctx: any, next: any) {
    const { filterByTk } = ctx.action.params;
    const ids = Array.isArray(filterByTk) ? filterByTk : [filterByTk];
    await ctx.db.getRepository('messageCenter').update({
      filter: { id: { $in: ids }, userId: ctx.state.currentUser?.id },
      values: { read: true, readAt: new Date() },
    });
    ctx.body = { success: true };
    await next();
  }

  private async markAllRead(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const { category } = ctx.action.params;
    const filter: any = { userId, read: false };
    if (category) filter.category = category;
    await ctx.db.getRepository('messageCenter').update({
      filter,
      values: { read: true, readAt: new Date() },
    });
    ctx.body = { success: true };
    await next();
  }

  private async getUnreadCount(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const total = await ctx.db.getRepository('messageCenter').count({ filter: { userId, read: false } });
    // Count per category
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat] = await ctx.db.getRepository('messageCenter').count({
        filter: { userId, read: false, category: cat },
      });
    }
    ctx.body = { total, categories: counts };
    await next();
  }

  private async getPreferences(ctx: any, next: any) {
    ctx.body = await this.getUserPreferences(ctx.state.currentUser?.id);
    await next();
  }

  private async savePreferences(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const values = ctx.action.params.values || {};
    await ctx.db.getRepository('messagePreferences').updateOrCreate({
      filterKeys: ['userId'],
      values: { userId, ...values },
    });
    ctx.body = { success: true };
    await next();
  }
}

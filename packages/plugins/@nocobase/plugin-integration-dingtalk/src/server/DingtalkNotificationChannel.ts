/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import axios from 'axios';
import { Application } from '@nocobase/server';
import { BaseNotificationChannel } from '@nocobase/plugin-notification-manager';
import { DINGTALK_API_BASE } from '../common/constants';

/**
 * DingTalk Work Notification Channel.
 * Sends work notifications (工作通知) to DingTalk users via the corp application.
 */
export class DingtalkNotificationChannel extends BaseNotificationChannel {
  constructor(app: Application) {
    super(app);
  }

  /**
   * Get the corp access token for sending notifications.
   */
  private async getAccessToken(): Promise<string> {
    const config = await this.app.db.getRepository('systemSettings').findOne({
      filter: { key: 'dingtalk' },
    });
    const { appKey, appSecret } = config?.value || {};

    const res = await axios.get(`${DINGTALK_API_BASE}/gettoken`, {
      params: { appkey: appKey, appsecret: appSecret },
    });

    if (res.data?.errcode !== 0) {
      throw new Error(`Failed to get DingTalk token: ${res.data?.errmsg}`);
    }
    return res.data.access_token;
  }

  /**
   * Send a work notification to DingTalk users.
   */
  async send(params: {
    channel: any;
    message: {
      title?: string;
      content: string;
      url?: string;
    };
    receivers?: {
      userIds?: (string | number)[];
    };
  }) {
    const { message, receivers } = params;

    try {
      const accessToken = await this.getAccessToken();

      // Resolve NocoBase user IDs to DingTalk user IDs
      const dingtalkUserIds = await this.resolveDingtalkUserIds(receivers?.userIds || []);

      if (!dingtalkUserIds.length) {
        return {
          message,
          status: 'fail' as const,
          reason: 'No DingTalk user IDs found for the given receivers',
        };
      }

      const config = await this.app.db.getRepository('systemSettings').findOne({
        filter: { key: 'dingtalk' },
      });
      const agentId = config?.value?.agentId;

      // Build the message payload
      const msgPayload: any = {
        agent_id: agentId,
        userid_list: dingtalkUserIds.join(','),
        msg: {
          msgtype: 'oa',
          oa: {
            head: { text: message.title || 'Notification' },
            body: {
              title: message.title || 'Notification',
              content: message.content,
            },
            message_url: message.url || '',
          },
        },
      };

      const res = await axios.post(
        `${DINGTALK_API_BASE}/topapi/message/corpconversation/asyncsend_v2`,
        msgPayload,
        { params: { access_token: accessToken } },
      );

      if (res.data?.errcode !== 0) {
        return {
          message,
          status: 'fail' as const,
          reason: res.data?.errmsg || 'Unknown error',
        };
      }

      return { message, status: 'success' as const };
    } catch (err) {
      return {
        message,
        status: 'fail' as const,
        reason: err.message,
      };
    }
  }

  /**
   * Convert NocoBase user IDs to DingTalk user IDs.
   */
  private async resolveDingtalkUserIds(userIds: (string | number)[]): Promise<string[]> {
    if (!userIds.length) return [];

    const users = await this.app.db.getRepository('users').find({
      filter: { id: { $in: userIds } },
      fields: ['dingtalkUserId'],
    });

    return users.map((u) => u.dingtalkUserId).filter(Boolean);
  }
}

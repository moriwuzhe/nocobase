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
import { DINGTALK_API_BASE, SYNC_STATUS } from '../common/constants';

/**
 * Syncs DingTalk organization departments and users to NocoBase.
 */
export class DingtalkContactSync {
  private app: Application;
  private status: string = SYNC_STATUS.IDLE;

  constructor(app: Application) {
    this.app = app;
  }

  getStatus() {
    return this.status;
  }

  /**
   * Get enterprise access token using appKey + appSecret.
   */
  private async getCorpToken(): Promise<string> {
    const config = await this.app.db.getRepository('systemSettings').findOne({
      filter: { key: 'dingtalk' },
    });
    const { appKey, appSecret } = config?.value || {};

    if (!appKey || !appSecret) {
      throw new Error('DingTalk appKey and appSecret are required');
    }

    const res = await axios.get(`${DINGTALK_API_BASE}/gettoken`, {
      params: { appkey: appKey, appsecret: appSecret },
    });

    if (res.data?.errcode !== 0) {
      throw new Error(`Failed to get DingTalk token: ${res.data?.errmsg}`);
    }
    return res.data.access_token;
  }

  /**
   * Recursively sync departments from DingTalk.
   */
  private async syncDepartments(accessToken: string, parentId: number = 1) {
    const res = await axios.get(`${DINGTALK_API_BASE}/topapi/v2/department/listsub`, {
      params: { access_token: accessToken, dept_id: parentId },
    });

    if (res.data?.errcode !== 0) {
      this.app.logger.warn(`[dingtalk] Failed to list departments under ${parentId}: ${res.data?.errmsg}`);
      return;
    }

    const departments = res.data?.result || [];
    const DeptRepo = this.app.db.getRepository('departments');

    for (const dept of departments) {
      await DeptRepo.updateOrCreate({
        filterKeys: ['externalId'],
        values: {
          externalId: `dingtalk:${dept.dept_id}`,
          title: dept.name,
          parentId: parentId === 1 ? null : `dingtalk:${parentId}`,
          sort: dept.order || 0,
        },
      });

      // Recurse into sub-departments
      await this.syncDepartments(accessToken, dept.dept_id);
    }
  }

  /**
   * Sync users from a specific DingTalk department.
   */
  private async syncDepartmentUsers(accessToken: string, deptId: number) {
    let cursor = 0;
    let hasMore = true;

    const UserRepo = this.app.db.getRepository('users');

    while (hasMore) {
      const res = await axios.post(
        `${DINGTALK_API_BASE}/topapi/v2/user/list`,
        { dept_id: deptId, cursor, size: 100 },
        { params: { access_token: accessToken } },
      );

      if (res.data?.errcode !== 0) {
        this.app.logger.warn(`[dingtalk] Failed to list users in dept ${deptId}: ${res.data?.errmsg}`);
        return;
      }

      const list = res.data?.result?.list || [];
      for (const user of list) {
        await UserRepo.updateOrCreate({
          filterKeys: ['dingtalkUserId'],
          values: {
            dingtalkUserId: user.userid,
            nickname: user.name,
            email: user.email || undefined,
            phone: user.mobile || undefined,
          },
        });
      }

      hasMore = res.data?.result?.has_more;
      cursor = res.data?.result?.next_cursor || 0;
    }
  }

  /**
   * Full sync: departments + users.
   */
  async sync() {
    if (this.status === SYNC_STATUS.SYNCING) {
      this.app.logger.warn('[dingtalk] Sync already in progress');
      return;
    }

    this.status = SYNC_STATUS.SYNCING;

    try {
      const accessToken = await this.getCorpToken();

      // Sync departments
      await this.syncDepartments(accessToken);

      // Sync users for root department (DingTalk root dept is 1)
      await this.syncDepartmentUsers(accessToken, 1);

      this.status = SYNC_STATUS.SUCCESS;
      this.app.logger.info('[dingtalk] Contact sync completed successfully');
    } catch (err) {
      this.status = SYNC_STATUS.FAILED;
      this.app.logger.error('[dingtalk] Contact sync failed:', err);
      throw err;
    }
  }
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { Model } from '@nocobase/database';
import axios from 'axios';

const WECOM_API = 'https://qyapi.weixin.qq.com/cgi-bin';

/**
 * WeCom OAuth2.0 Authentication Type.
 */
export class WecomAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({ ...config, userCollection: ctx.db.getCollection('users') });
  }

  async validate() {
    const ctx = this.ctx;
    const { code } = ctx.action.params.values || {};
    if (!code) ctx.throw(400, 'WeCom authorization code is required');

    const options = this.options?.public || {};
    const { corpId, corpSecret } = options;
    if (!corpId || !corpSecret) ctx.throw(500, 'WeCom Corp ID/Secret not configured');

    // Get access token
    const tokenRes = await axios.get(`${WECOM_API}/gettoken`, {
      params: { corpid: corpId, corpsecret: corpSecret },
    });
    if (tokenRes.data?.errcode !== 0) ctx.throw(401, `WeCom token error: ${tokenRes.data?.errmsg}`);

    // Get user identity
    const userRes = await axios.get(`${WECOM_API}/auth/getuserinfo`, {
      params: { access_token: tokenRes.data.access_token, code },
    });
    if (userRes.data?.errcode !== 0) ctx.throw(401, `WeCom auth failed: ${userRes.data?.errmsg}`);

    const wecomUserId = userRes.data.userid || userRes.data.UserId;

    let user: Model = await this.userRepository.findOne({
      filter: { wecomUserId },
    });

    if (!user) {
      // Try to get user details
      const detailRes = await axios.get(`${WECOM_API}/user/get`, {
        params: { access_token: tokenRes.data.access_token, userid: wecomUserId },
      });
      const detail = detailRes.data || {};
      user = await this.userRepository.create({
        values: {
          nickname: detail.name || wecomUserId,
          email: detail.email || undefined,
          phone: detail.mobile || undefined,
          wecomUserId,
        },
      });
    }

    return user;
  }
}

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
import { DINGTALK_TOKEN_URL, DINGTALK_API_V2_BASE } from '../common/constants';

/**
 * DingTalk OAuth2.0 Authentication Type.
 * Registered with app.authManager.registerTypes() so it appears
 * in the authentication providers list in NocoBase admin.
 */
export class DingtalkAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({
      ...config,
      userCollection: ctx.db.getCollection('users'),
    });
  }

  /**
   * Validate the DingTalk auth code and return/create a user.
   */
  async validate() {
    const ctx = this.ctx;
    const { code } = ctx.action.params.values || {};

    if (!code) {
      ctx.throw(400, 'DingTalk authorization code is required');
    }

    const options = this.options?.public || {};
    const { appKey, appSecret } = options;

    if (!appKey || !appSecret) {
      ctx.throw(500, 'DingTalk App Key/Secret not configured');
    }

    // Exchange code for access token
    const tokenRes = await axios.post(DINGTALK_TOKEN_URL, {
      clientId: appKey,
      clientSecret: appSecret,
      code,
      grantType: 'authorization_code',
    });

    if (!tokenRes.data?.accessToken) {
      ctx.throw(401, `DingTalk auth failed: ${JSON.stringify(tokenRes.data)}`);
    }

    // Get user info
    const userInfoRes = await axios.get(`${DINGTALK_API_V2_BASE}/contact/users/me`, {
      headers: { 'x-acs-dingtalk-access-token': tokenRes.data.accessToken },
    });

    const { unionId, nick, email, mobile, avatarUrl } = userInfoRes.data;

    // Find or create user
    let user: Model = await this.userRepository.findOne({
      filter: { $or: [{ dingtalkUnionId: unionId }, ...(email ? [{ email }] : []), ...(mobile ? [{ phone: mobile }] : [])] },
    });

    if (!user) {
      user = await this.userRepository.create({
        values: {
          nickname: nick,
          email: email || undefined,
          phone: mobile || undefined,
          dingtalkUnionId: unionId,
        },
      });
    } else if (!user.get('dingtalkUnionId')) {
      await this.userRepository.update({
        filterByTk: user.get('id'),
        values: { dingtalkUnionId: unionId },
      });
    }

    return user;
  }
}

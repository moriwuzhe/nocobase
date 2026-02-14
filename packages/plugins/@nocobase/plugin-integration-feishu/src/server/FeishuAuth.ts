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

const FEISHU_API = 'https://open.feishu.cn/open-apis';

/**
 * Feishu / Lark OAuth2.0 Authentication Type.
 */
export class FeishuAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({ ...config, userCollection: ctx.db.getCollection('users') });
  }

  async validate() {
    const ctx = this.ctx;
    const { code } = ctx.action.params.values || {};
    if (!code) ctx.throw(400, 'Feishu authorization code is required');

    const options = this.options?.public || {};
    const { appId, appSecret } = options;
    if (!appId || !appSecret) ctx.throw(500, 'Feishu App ID/Secret not configured');

    // Get tenant access token
    const tenantRes = await axios.post(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
      app_id: appId,
      app_secret: appSecret,
    });
    if (tenantRes.data?.code !== 0) ctx.throw(401, `Feishu token error: ${tenantRes.data?.msg}`);
    const tenantToken = tenantRes.data.tenant_access_token;

    // Exchange code for user access token
    const tokenRes = await axios.post(
      `${FEISHU_API}/authen/v1/oidc/access_token`,
      { grant_type: 'authorization_code', code },
      { headers: { Authorization: `Bearer ${tenantToken}` } },
    );
    if (tokenRes.data?.code !== 0) ctx.throw(401, `Feishu auth failed: ${tokenRes.data?.msg}`);
    const userAccessToken = tokenRes.data.data.access_token;

    // Get user info
    const userRes = await axios.get(`${FEISHU_API}/authen/v1/user_info`, {
      headers: { Authorization: `Bearer ${userAccessToken}` },
    });
    const info = userRes.data?.data || {};

    let user: Model = await this.userRepository.findOne({
      filter: { $or: [{ feishuOpenId: info.open_id }, ...(info.email ? [{ email: info.email }] : [])] },
    });

    if (!user) {
      user = await this.userRepository.create({
        values: {
          nickname: info.name,
          email: info.email || undefined,
          phone: info.mobile || undefined,
          feishuOpenId: info.open_id,
          feishuUnionId: info.union_id,
        },
      });
    } else if (!user.get('feishuOpenId')) {
      await this.userRepository.update({
        filterByTk: user.get('id'),
        values: { feishuOpenId: info.open_id, feishuUnionId: info.union_id },
      });
    }

    return user;
  }
}

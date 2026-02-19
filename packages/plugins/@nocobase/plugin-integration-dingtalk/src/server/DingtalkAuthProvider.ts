/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import axios from 'axios';
import { DINGTALK_AUTH_URL, DINGTALK_TOKEN_URL, DINGTALK_API_V2_BASE } from '../common/constants';

/**
 * DingTalk OAuth2.0 Auth Provider
 *
 * Flow:
 * 1. Redirect user to DingTalk authorization URL
 * 2. DingTalk redirects back with auth code
 * 3. Exchange code for user access token
 * 4. Fetch user info from DingTalk
 * 5. Match or create local user
 */
export class DingtalkAuthProvider {
  config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  /**
   * Generate the DingTalk OAuth URL for login redirection.
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid corpid',
      state,
      prompt: 'consent',
    });
    return `${DINGTALK_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for user access token.
   */
  async getAccessToken(code: string): Promise<string> {
    const res = await axios.post(DINGTALK_TOKEN_URL, {
      clientId: this.config.appKey,
      clientSecret: this.config.appSecret,
      code,
      grantType: 'authorization_code',
    });

    if (res.data?.accessToken) {
      return res.data.accessToken;
    }
    throw new Error(`DingTalk token exchange failed: ${JSON.stringify(res.data)}`);
  }

  /**
   * Fetch user information using the access token.
   */
  async getUserInfo(accessToken: string): Promise<{
    unionId: string;
    openId: string;
    nick: string;
    avatarUrl: string;
    email: string;
    mobile: string;
  }> {
    const res = await axios.get(`${DINGTALK_API_V2_BASE}/contact/users/me`, {
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
      },
    });

    return res.data;
  }

  /**
   * Authenticate: called with the auth code from the callback.
   * Returns the user data needed to match/create a NocoBase user.
   */
  async authenticate(code: string) {
    const accessToken = await this.getAccessToken(code);
    const userInfo = await this.getUserInfo(accessToken);

    return {
      externalId: userInfo.unionId,
      provider: 'dingtalk',
      nickname: userInfo.nick,
      avatar: userInfo.avatarUrl,
      email: userInfo.email,
      phone: userInfo.mobile,
    };
  }
}

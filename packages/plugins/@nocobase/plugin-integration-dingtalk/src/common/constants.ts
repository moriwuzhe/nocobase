/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export const NAMESPACE = 'integration-dingtalk';

export const DINGTALK_API_BASE = 'https://oapi.dingtalk.com';
export const DINGTALK_API_V2_BASE = 'https://api.dingtalk.com/v1.0';

export const DINGTALK_AUTH_URL = 'https://login.dingtalk.com/oauth2/auth';
export const DINGTALK_TOKEN_URL = 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken';

export const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

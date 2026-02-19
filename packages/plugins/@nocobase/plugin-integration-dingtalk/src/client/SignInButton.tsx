/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Button, Space } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAPIClient, css } from '@nocobase/client';

const DINGTALK_AUTH_URL = 'https://login.dingtalk.com/oauth2/auth';

/**
 * DingTalk SSO sign-in button shown on the NocoBase login page.
 * When clicked, redirects to DingTalk OAuth authorization page.
 */
export const DingtalkSignInForm: React.FC<{ authenticator: any }> = ({ authenticator }) => {
  const handleClick = () => {
    const options = authenticator?.options?.public || {};
    const { appKey } = options;
    if (!appKey) {
      console.warn('DingTalk App Key not configured');
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth:signIn`);
    const state = encodeURIComponent(JSON.stringify({ authenticator: authenticator.name }));
    const url = `${DINGTALK_AUTH_URL}?client_id=${appKey}&redirect_uri=${redirectUri}&response_type=code&scope=openid corpid&state=${state}&prompt=consent`;
    window.location.href = url;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        block
        size="large"
        icon={<LoginOutlined />}
        onClick={handleClick}
        className={css`
          background: #0089ff;
          color: #fff;
          border: none;
          border-radius: 8px;
          height: 44px;
          &:hover {
            background: #0078e6 !important;
            color: #fff !important;
          }
        `}
      >
        Sign in with DingTalk
      </Button>
    </Space>
  );
};

/**
 * Admin settings form for configuring DingTalk SSO.
 */
export const DingtalkAdminSettingsForm: React.FC = () => {
  return null; // Settings are managed via the DingTalk config page
};

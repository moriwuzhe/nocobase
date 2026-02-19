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
import { css } from '@nocobase/client';

export const FeishuSignInForm: React.FC<{ authenticator: any }> = ({ authenticator }) => {
  const handleClick = () => {
    const options = authenticator?.options?.public || {};
    const { appId } = options;
    if (!appId) return;
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth:signIn`);
    const state = encodeURIComponent(JSON.stringify({ authenticator: authenticator.name }));
    window.location.href = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        block size="large" icon={<LoginOutlined />} onClick={handleClick}
        className={css`
          background: #3370ff; color: #fff; border: none; border-radius: 8px; height: 44px;
          &:hover { background: #2860e0 !important; color: #fff !important; }
        `}
      >
        Sign in with Feishu
      </Button>
    </Space>
  );
};

export const FeishuAdminSettingsForm: React.FC = () => null;

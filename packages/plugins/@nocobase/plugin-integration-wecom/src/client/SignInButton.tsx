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
import { WechatOutlined } from '@ant-design/icons';
import { css } from '@nocobase/client';

export const WecomSignInForm: React.FC<{ authenticator: any }> = ({ authenticator }) => {
  const handleClick = () => {
    const options = authenticator?.options?.public || {};
    const { corpId } = options;
    if (!corpId) return;
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth:signIn`);
    const state = encodeURIComponent(JSON.stringify({ authenticator: authenticator.name }));
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        block size="large" icon={<WechatOutlined />} onClick={handleClick}
        className={css`
          background: #07C160; color: #fff; border: none; border-radius: 8px; height: 44px;
          &:hover { background: #06ad56 !important; color: #fff !important; }
        `}
      >
        Sign in with WeCom
      </Button>
    </Space>
  );
};

export const WecomAdminSettingsForm: React.FC = () => null;

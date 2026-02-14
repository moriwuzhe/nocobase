/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, WechatOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

interface PortalLoginProps {
  portal: {
    title: string;
    branding?: { logoUrl?: string; primaryColor?: string };
    authConfig?: {
      allowEmailLogin?: boolean;
      allowPhoneLogin?: boolean;
      allowSelfRegister?: boolean;
      allowWechatLogin?: boolean;
    };
  };
  onLogin: (credentials: { email?: string; phone?: string; password: string }) => Promise<void>;
  onRegister?: () => void;
}

/**
 * Portal Login Page — a standalone login page rendered for external portal users.
 * Supports email login, phone login, and social login based on portal config.
 */
export const PortalLogin: React.FC<PortalLoginProps> = ({ portal, onLogin, onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [form] = Form.useForm();

  const authConfig = portal.authConfig || {};
  const branding = portal.branding || {};

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await onLogin(values);
    } catch (err: any) {
      if (err.errorFields) {
        // Validation error
      } else {
        message.error(err.message || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" style={{ height: 48, marginBottom: 12 }} />
          )}
          <Title level={3} style={{ margin: 0 }}>{portal.title}</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {/* Login method toggle */}
        {authConfig.allowEmailLogin && authConfig.allowPhoneLogin && (
          <Space style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Button
              type={loginMethod === 'email' ? 'primary' : 'default'}
              size="small"
              onClick={() => setLoginMethod('email')}
            >
              Email
            </Button>
            <Button
              type={loginMethod === 'phone' ? 'primary' : 'default'}
              size="small"
              onClick={() => setLoginMethod('phone')}
            >
              Phone
            </Button>
          </Space>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {loginMethod === 'email' ? (
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
          ) : (
            <Form.Item name="phone" rules={[{ required: true, message: 'Please enter your phone number' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Phone number" size="large" />
            </Form.Item>
          )}

          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ borderRadius: 8, background: branding.primaryColor || undefined }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {authConfig.allowWechatLogin && (
          <>
            <Divider plain><Text type="secondary">or</Text></Divider>
            <Button
              block
              size="large"
              icon={<WechatOutlined style={{ color: '#07C160' }} />}
              style={{ borderRadius: 8 }}
            >
              Sign in with WeChat
            </Button>
          </>
        )}

        {authConfig.allowSelfRegister && onRegister && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">Don't have an account? </Text>
            <Link onClick={onRegister}>Register</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

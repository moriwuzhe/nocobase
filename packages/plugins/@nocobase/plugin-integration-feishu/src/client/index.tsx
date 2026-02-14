/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Tag, Typography, Divider } from 'antd';
import { SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Text, Title } = Typography;

const FeishuConfigPage: React.FC = () => {
  const api = useAPIClient();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request({ url: 'feishu:getConfig' });
        form.setFieldsValue(res.data?.data || {});
      } catch { /* ignore */ }
    })();
  }, [api, form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await api.request({ url: 'feishu:saveConfig', method: 'POST', data: { values } });
      message.success('Configuration saved');
    } catch (err: any) {
      message.error(err.message || 'Save failed');
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await api.request({ url: 'feishu:syncContacts', method: 'POST' });
      message.success('Contact sync started');
      setSyncStatus('success');
    } catch {
      setSyncStatus('failed');
      message.error('Sync failed');
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Title level={4}>Feishu / Lark Integration</Title>
      <Text type="secondary">
        Connect your Feishu organization for SSO, contact sync, and message push.
      </Text>
      <Divider />
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item
            name="appId"
            label="App ID"
            rules={[{ required: true, message: 'Please enter the Feishu App ID' }]}
          >
            <Input placeholder="cli_xxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="appSecret"
            label="App Secret"
            rules={[{ required: true, message: 'Please enter the Feishu App Secret' }]}
          >
            <Input.Password placeholder="Enter app secret" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSave} loading={loading}>
                Save Configuration
              </Button>
              <Button icon={<SyncOutlined spin={syncStatus === 'syncing'} />} onClick={handleSync}>
                Sync Contacts
              </Button>
              {syncStatus === 'success' && (
                <Tag icon={<CheckCircleOutlined />} color="success">Sync Complete</Tag>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export class PluginIntegrationFeishuClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('integration-feishu', {
      icon: 'LinkOutlined',
      title: tval('Feishu'),
      Component: FeishuConfigPage,
    });

    try {
      const AuthPlugin = this.app.pm.get('auth') as any;
      if (AuthPlugin?.registerType) {
        const { FeishuSignInForm, FeishuAdminSettingsForm } = await import('./SignInButton');
        AuthPlugin.registerType('feishu-oauth', {
          components: { SignInForm: FeishuSignInForm, AdminSettingsForm: FeishuAdminSettingsForm },
        });
      }
    } catch { /* ignore */ }
  }
}

export default PluginIntegrationFeishuClient;

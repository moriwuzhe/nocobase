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
import { SyncOutlined, CheckCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
import { NAMESPACE } from '../common/constants';

const { Text, Title } = Typography;

const DingtalkConfigPage: React.FC = () => {
  const api = useAPIClient();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request({ url: 'dingtalk:getConfig' });
        form.setFieldsValue(res.data?.data || {});
      } catch {
        // ignore
      }
    })();
  }, [api, form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await api.request({ url: 'dingtalk:saveConfig', method: 'POST', data: { values } });
      message.success('Configuration saved');
    } catch (err: any) {
      message.error(err.message || 'Save failed');
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await api.request({ url: 'dingtalk:syncContacts', method: 'POST' });
      message.success('Contact sync started');
      setSyncStatus('success');
    } catch {
      setSyncStatus('failed');
      message.error('Sync failed');
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Title level={4}>DingTalk Integration</Title>
      <Text type="secondary">
        Connect your DingTalk organization for SSO, contact sync, and message push.
      </Text>
      <Divider />
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item
            name="appKey"
            label="App Key"
            rules={[{ required: true, message: 'Please enter the DingTalk App Key' }]}
          >
            <Input placeholder="dingxxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="appSecret"
            label="App Secret"
            rules={[{ required: true, message: 'Please enter the DingTalk App Secret' }]}
          >
            <Input.Password placeholder="Enter app secret" />
          </Form.Item>
          <Form.Item name="agentId" label="Agent ID">
            <Input placeholder="Agent ID for work notifications" />
          </Form.Item>
          <Form.Item name="corpId" label="Corp ID">
            <Input placeholder="Corp ID for SSO" />
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

export class PluginIntegrationDingtalkClient extends Plugin {
  async load() {
    try {
      const zhCN = (await import('../locale/zh-CN.json')).default;
      this.app.i18n.addResources('zh-CN', NAMESPACE, zhCN);
    } catch { /* locale file may not exist */ }

    this.app.pluginSettingsManager.add('integration-dingtalk', {
      icon: 'LinkOutlined',
      title: tval('DingTalk'),
      Component: DingtalkConfigPage,
    });

    // Register DingTalk SSO as an auth type on the login page
    try {
      const AuthPlugin = this.app.pm.get('auth') as any;
      if (AuthPlugin?.registerType) {
        const { DingtalkSignInForm, DingtalkAdminSettingsForm } = await import('./SignInButton');
        AuthPlugin.registerType('dingtalk-oauth', {
          components: {
            SignInForm: DingtalkSignInForm,
            AdminSettingsForm: DingtalkAdminSettingsForm,
          },
        });
      }
    } catch { /* auth plugin not available */ }
  }
}

export default PluginIntegrationDingtalkClient;

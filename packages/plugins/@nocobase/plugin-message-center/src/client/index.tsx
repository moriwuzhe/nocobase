/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge, Button, Drawer, List, Tabs, Tag, Space, Typography, Empty,
  Switch, Form, Divider, Tooltip, Popover, Spin, message as antMessage,
} from 'antd';
import {
  BellOutlined, CheckOutlined, CheckCircleOutlined, MailOutlined,
  SettingOutlined, DeleteOutlined, InfoCircleOutlined,
  WarningOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Text, Paragraph } = Typography;

const levelIcons: Record<string, React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: '#1677ff' }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  warning: <WarningOutlined style={{ color: '#faad14' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const categoryColors: Record<string, string> = {
  system: 'default', approval: 'orange', comment: 'blue',
  workflow: 'purple', mention: 'cyan', custom: 'green',
};

/** Notification bell button shown in the top-right nav. */
const NotificationBell: React.FC = () => {
  const api = useAPIClient();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [prefsVisible, setPrefsVisible] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.request({ url: 'messageCenter:getUnreadCount' });
      setUnreadCount(res.data?.data?.total || 0);
    } catch { /* ignore */ }
  }, [api]);

  const fetchMessages = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const params: any = { page: 1, pageSize: 50 };
      if (category) params.category = category;
      const res = await api.request({ url: 'messageCenter:listMine', params });
      setMessages(res.data?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, [fetchUnread]);

  useEffect(() => {
    if (drawerVisible) fetchMessages(activeCategory);
  }, [drawerVisible, activeCategory, fetchMessages]);

  const markRead = async (ids: string | string[]) => {
    await api.request({ url: 'messageCenter:markRead', method: 'POST', params: { filterByTk: ids } });
    fetchMessages(activeCategory);
    fetchUnread();
  };

  const markAllRead = async () => {
    await api.request({ url: 'messageCenter:markAllRead', method: 'POST', params: { category: activeCategory } });
    fetchMessages(activeCategory);
    fetchUnread();
    antMessage.success('All marked as read');
  };

  return (
    <>
      <Tooltip title="Notifications">
        <Badge count={unreadCount} size="small" offset={[-2, 4]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            onClick={() => setDrawerVisible(true)}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Space><BellOutlined /> Messages</Space>
            <Space>
              <Button size="small" icon={<CheckOutlined />} onClick={markAllRead}>Mark all read</Button>
              <Button size="small" icon={<SettingOutlined />} onClick={() => setPrefsVisible(true)} />
            </Space>
          </Space>
        }
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={420}
      >
        <Tabs
          size="small"
          onChange={(key) => setActiveCategory(key === 'all' ? undefined : key)}
          items={[
            { key: 'all', label: 'All' },
            { key: 'system', label: 'System' },
            { key: 'approval', label: 'Approval' },
            { key: 'comment', label: 'Comments' },
            { key: 'workflow', label: 'Workflow' },
          ]}
        />
        <Spin spinning={loading}>
          {messages.length === 0 ? (
            <Empty description="No messages" />
          ) : (
            <List
              size="small"
              dataSource={messages}
              renderItem={(msg: any) => (
                <List.Item
                  style={{
                    background: msg.read ? 'transparent' : '#f6ffed',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                  onClick={() => !msg.read && markRead(msg.id)}
                >
                  <List.Item.Meta
                    avatar={levelIcons[msg.level] || levelIcons.info}
                    title={
                      <Space>
                        <Text strong={!msg.read} style={{ fontSize: 13 }}>{msg.title}</Text>
                        <Tag color={categoryColors[msg.category]} style={{ fontSize: 10 }}>{msg.category}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 2, fontSize: 12, color: '#666' }}>
                          {msg.content}
                        </Paragraph>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Drawer>

      {/* Preferences Drawer */}
      <PreferencesDrawer visible={prefsVisible} onClose={() => setPrefsVisible(false)} />
    </>
  );
};

const PreferencesDrawer: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const api = useAPIClient();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const res = await api.request({ url: 'messageCenter:getPreferences' });
        form.setFieldsValue(res.data?.data || {});
      } catch { /* ignore */ }
    })();
  }, [visible, api, form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      await api.request({ url: 'messageCenter:savePreferences', method: 'POST', data: { values } });
      antMessage.success('Preferences saved');
      onClose();
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <Drawer title="Notification Preferences" open={visible} onClose={onClose} width={360}
      extra={<Button type="primary" onClick={handleSave} loading={loading}>Save</Button>}>
      <Form form={form} layout="vertical">
        <Divider orientation="left" plain>Channels</Divider>
        <Form.Item name="enableInApp" label="In-App" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="enableEmail" label="Email" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="enableDingtalk" label="DingTalk" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="enableWecom" label="WeCom" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="enableFeishu" label="Feishu" valuePropName="checked"><Switch /></Form.Item>
        <Divider orientation="left" plain>Do Not Disturb</Divider>
        <Form.Item name="doNotDisturb" label="Enable" valuePropName="checked"><Switch /></Form.Item>
        <Space>
          <Form.Item name="doNotDisturbStart" label="From"><input type="time" /></Form.Item>
          <Form.Item name="doNotDisturbEnd" label="To"><input type="time" /></Form.Item>
        </Space>
      </Form>
    </Drawer>
  );
};

export class PluginMessageCenterClient extends Plugin {
  async load() {
    this.app.addComponents({ NotificationBell });
  }
}

export default PluginMessageCenterClient;
export { NotificationBell };

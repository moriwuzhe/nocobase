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
  Table, Button, Modal, Form, Input, Select, Switch, Space, Tag, Popconfirm,
  message, Typography, Card, Tabs, Descriptions, Badge, InputNumber, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, SendOutlined,
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WebhookManager: React.FC = () => {
  const api = useAPIClient();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'webhooks:list', params: { sort: ['-createdAt'], appends: ['logs'] } });
      setWebhooks(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (values.events && typeof values.events === 'string') {
      values.events = values.events.split(',').map((s: string) => s.trim());
    }
    if (values.headers && typeof values.headers === 'string') {
      try { values.headers = JSON.parse(values.headers); } catch { values.headers = {}; }
    }
    if (editing) {
      await api.request({ url: `webhooks:update/${editing.id}`, method: 'POST', data: values });
    } else {
      await api.request({ url: 'webhooks:create', method: 'POST', data: values });
    }
    message.success('Saved');
    setModalVisible(false);
    form.resetFields();
    setEditing(null);
    fetchWebhooks();
  };

  const handleDelete = async (id: string) => {
    await api.request({ url: `webhooks:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    fetchWebhooks();
  };

  const handleTest = async (id: string) => {
    try {
      await api.request({ url: `webhooks:test/${id}`, method: 'POST' });
      message.success('Test webhook sent');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const openLogs = async (wh: any) => {
    setSelectedWebhook(wh);
    try {
      const res = await api.request({
        url: 'webhookLogs:list',
        params: { filter: { webhookId: wh.id }, sort: ['-createdAt'], limit: 50 },
      });
      setLogs(res.data?.data || []);
    } catch { /* ignore */ }
    setLogsModalVisible(true);
  };

  const columns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (v: string, r: any) => <Space><ApiOutlined /><Text strong>{v}</Text></Space>,
    },
    {
      title: 'Type', dataIndex: 'type', key: 'type',
      render: (v: string) => <Tag color={v === 'outbound' ? 'blue' : 'green'}>{v}</Tag>,
    },
    { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true, render: (v: string) => <Text code copyable>{v}</Text> },
    {
      title: 'Events', dataIndex: 'events', key: 'events',
      render: (v: string[]) => <Space wrap>{(v || []).slice(0, 3).map((e) => <Tag key={e}>{e}</Tag>)}{(v || []).length > 3 && <Tag>+{v.length - 3}</Tag>}</Space>,
    },
    {
      title: 'Status', dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean) => v ? <Badge status="success" text="Active" /> : <Badge status="default" text="Disabled" />,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          {r.type === 'outbound' && (
            <Tooltip title="Send test"><Button size="small" icon={<SendOutlined />} onClick={() => handleTest(r.id)} /></Tooltip>
          )}
          <Button size="small" icon={<EyeOutlined />} onClick={() => openLogs(r)}>Logs</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue({ ...r, events: (r.events || []).join(', '), headers: JSON.stringify(r.headers || {}, null, 2) }); setModalVisible(true); }} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const logColumns = [
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => v === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : v === 'timeout' ? <ClockCircleOutlined style={{ color: '#faad14' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    },
    { title: 'Event', dataIndex: 'event', key: 'event', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Code', dataIndex: 'statusCode', key: 'statusCode' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', render: (v: number) => `${v}ms` },
    { title: 'Retries', dataIndex: 'retryCount', key: 'retryCount' },
    { title: 'Time', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleString() },
    { title: 'Error', dataIndex: 'error', key: 'error', ellipsis: true },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Webhook Hub</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>New Webhook</Button>
      </Space>
      <Table dataSource={webhooks} columns={columns} rowKey="id" loading={loading} />

      <Modal title={editing ? 'Edit Webhook' : 'New Webhook'} open={modalVisible} onOk={handleSave} onCancel={() => { setModalVisible(false); form.resetFields(); setEditing(null); }} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Order Notifier" /></Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue="outbound">
            <Select options={[{ label: 'Outbound (send to URL)', value: 'outbound' }, { label: 'Inbound (receive from URL)', value: 'inbound' }]} />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}><Input placeholder="https://example.com/webhook" /></Form.Item>
          <Form.Item name="events" label="Events (comma-separated)"><Input placeholder="orders.afterCreate, orders.afterUpdate" /></Form.Item>
          <Form.Item name="secret" label="Signing Secret"><Input.Password placeholder="HMAC SHA-256 secret" /></Form.Item>
          <Form.Item name="collectionName" label="Target Collection (inbound)"><Input placeholder="For inbound: auto-create records in this collection" /></Form.Item>
          <Form.Item name="method" label="HTTP Method" initialValue="POST">
            <Select options={[{ label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'PATCH', value: 'PATCH' }]} />
          </Form.Item>
          <Form.Item name="headers" label="Custom Headers (JSON)"><TextArea rows={2} placeholder='{"Authorization": "Bearer xxx"}' /></Form.Item>
          <Space>
            <Form.Item name="maxRetries" label="Max Retries" initialValue={3}><InputNumber min={0} max={10} /></Form.Item>
            <Form.Item name="timeoutMs" label="Timeout (ms)" initialValue={10000}><InputNumber min={1000} max={60000} step={1000} /></Form.Item>
          </Space>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`Logs — ${selectedWebhook?.name}`} open={logsModalVisible} onCancel={() => setLogsModalVisible(false)} width={900} footer={null}>
        <Table dataSource={logs} columns={logColumns} rowKey="id" size="small" pagination={{ pageSize: 20 }} />
      </Modal>
    </div>
  );
};

export class PluginWebhookHubClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('webhook-hub', {
      icon: 'ApiOutlined',
      title: tval('Webhook Hub'),
      Component: WebhookManager,
    });
  }
}

export default PluginWebhookHubClient;

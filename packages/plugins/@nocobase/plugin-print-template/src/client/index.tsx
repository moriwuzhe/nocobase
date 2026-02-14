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
  Table, Button, Modal, Form, Input, Select, Switch, Space, message,
  Typography, Card, Divider, Tag, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PrintTemplateManager: React.FC = () => {
  const api = useAPIClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'printTemplates:list', params: { sort: ['-createdAt'] } });
      setTemplates(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.request({ url: `printTemplates:update/${editing.id}`, method: 'POST', data: values });
    } else {
      await api.request({ url: 'printTemplates:create', method: 'POST', data: values });
    }
    message.success('Saved');
    setModalVisible(false);
    form.resetFields();
    setEditing(null);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    await api.request({ url: `printTemplates:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    fetchTemplates();
  };

  const handlePreview = (template: any) => {
    // Simple preview with placeholder data
    const html = template.content
      .replace(/\{\{([^}]+)\}\}/g, '<span style="background:#e6f4ff;padding:0 4px;border-radius:2px">{{$1}}</span>');
    setPreviewHtml(html);
    setPreviewVisible(true);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Collection', dataIndex: 'collectionName', key: 'collectionName', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Paper', dataIndex: 'paperSize', key: 'paperSize' },
    { title: 'Orientation', dataIndex: 'orientation', key: 'orientation' },
    { title: 'Enabled', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handlePreview(r)}>Preview</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalVisible(true); }}>Edit</Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Print Templates</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>
          New Template
        </Button>
      </Space>
      <Table dataSource={templates} columns={columns} rowKey="id" loading={loading} />

      <Modal title={editing ? 'Edit Template' : 'New Template'} open={modalVisible} width={800}
        onOk={handleSave} onCancel={() => { setModalVisible(false); form.resetFields(); setEditing(null); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Invoice Template" />
          </Form.Item>
          <Form.Item name="collectionName" label="Collection" rules={[{ required: true }]}>
            <Input placeholder="e.g. orders" />
          </Form.Item>
          <Form.Item name="content" label="Template HTML" rules={[{ required: true }]}>
            <TextArea rows={12} placeholder={'<h1>Invoice #{{id}}</h1>\n<p>Customer: {{customer.name}}</p>\n<p>Date: {{currentDate}}</p>'} />
          </Form.Item>
          <Text type="secondary">
            Use {'{{fieldName}}'} for variables. Nested: {'{{relation.field}}'}. System: {'{{currentDate}}'}, {'{{currentUser.nickname}}'}.
          </Text>
          <Divider />
          <Space>
            <Form.Item name="paperSize" label="Paper Size" initialValue="A4">
              <Select style={{ width: 100 }} options={[
                { label: 'A4', value: 'A4' }, { label: 'A5', value: 'A5' },
                { label: 'Letter', value: 'Letter' }, { label: 'Legal', value: 'Legal' },
              ]} />
            </Form.Item>
            <Form.Item name="orientation" label="Orientation" initialValue="portrait">
              <Select style={{ width: 120 }} options={[
                { label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' },
              ]} />
            </Form.Item>
          </Space>
          <Form.Item name="showWatermark" label="Watermark" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="watermarkText" label="Watermark Text"><Input placeholder="CONFIDENTIAL" /></Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Preview" open={previewVisible} width={800} footer={null}
        onCancel={() => setPreviewVisible(false)}>
        <div style={{ border: '1px solid #d9d9d9', padding: 24, minHeight: 400 }}
          dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </Modal>
    </div>
  );
};

export class PluginPrintTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('print-templates', {
      icon: 'PrinterOutlined',
      title: tval('Print Templates'),
      Component: PrintTemplateManager,
    });
  }
}

export default PluginPrintTemplateClient;

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
  Table, Button, Modal, Form, Input, Switch, Space, Tag, Popconfirm,
  message, ColorPicker, InputNumber, Typography, Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const DictionaryManager: React.FC = () => {
  const api = useAPIClient();
  const [dictionaries, setDictionaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDict, setEditingDict] = useState<any>(null);
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [selectedDict, setSelectedDict] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  const fetchDictionaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'dictionaries:list', params: { appends: ['items'], sort: ['-createdAt'] } });
      setDictionaries(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchDictionaries(); }, [fetchDictionaries]);

  const handleSaveDict = async () => {
    const values = await form.validateFields();
    if (editingDict) {
      await api.request({ url: `dictionaries:update/${editingDict.id}`, method: 'POST', data: values });
    } else {
      await api.request({ url: 'dictionaries:create', method: 'POST', data: values });
    }
    message.success('Saved');
    setModalVisible(false);
    form.resetFields();
    setEditingDict(null);
    fetchDictionaries();
  };

  const handleDeleteDict = async (id: string) => {
    await api.request({ url: `dictionaries:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    fetchDictionaries();
  };

  const openItemsModal = (dict: any) => {
    setSelectedDict(dict);
    setItems(dict.items || []);
    setItemsModalVisible(true);
  };

  const handleAddItem = async () => {
    const values = await itemForm.validateFields();
    await api.request({
      url: 'dictionaryItems:create',
      method: 'POST',
      data: { ...values, dictionaryId: selectedDict.id },
    });
    itemForm.resetFields();
    fetchDictionaries();
    // Refresh items
    const res = await api.request({ url: `dictionaries:get/${selectedDict.id}`, params: { appends: ['items'] } });
    setItems(res.data?.data?.items || []);
  };

  const handleDeleteItem = async (id: string) => {
    await api.request({ url: `dictionaryItems:destroy/${id}`, method: 'POST' });
    const res = await api.request({ url: `dictionaries:get/${selectedDict.id}`, params: { appends: ['items'] } });
    setItems(res.data?.data?.items || []);
    fetchDictionaries();
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Items',
      key: 'items',
      render: (_: any, r: any) => (
        <Space wrap>
          {(r.items || []).slice(0, 5).map((item: any) => (
            <Tag key={item.id} color={item.color}>{item.label}</Tag>
          ))}
          {(r.items || []).length > 5 && <Tag>+{r.items.length - 5}</Tag>}
        </Space>
      ),
    },
    { title: 'Enabled', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<SettingOutlined />} onClick={() => openItemsModal(r)}>Items</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingDict(r); form.setFieldsValue(r); setModalVisible(true); }}>Edit</Button>
          {!r.system && (
            <Popconfirm title="Delete?" onConfirm={() => handleDeleteDict(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Data Dictionary</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDict(null); form.resetFields(); setModalVisible(true); }}>
          New Dictionary
        </Button>
      </Space>
      <Table dataSource={dictionaries} columns={columns} rowKey="id" loading={loading} pagination={false} />

      {/* Dictionary edit modal */}
      <Modal title={editingDict ? 'Edit Dictionary' : 'New Dictionary'} open={modalVisible}
        onOk={handleSaveDict} onCancel={() => { setModalVisible(false); form.resetFields(); setEditingDict(null); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input placeholder="e.g. order_status" disabled={!!editingDict} /></Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g. Order Status" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>

      {/* Items modal */}
      <Modal title={`Items: ${selectedDict?.title || ''}`} open={itemsModalVisible}
        onCancel={() => setItemsModalVisible(false)} width={700} footer={null}>
        <Table size="small" dataSource={items} rowKey="id" pagination={false}
          columns={[
            { title: 'Value', dataIndex: 'value' },
            { title: 'Label', dataIndex: 'label', render: (v: string, r: any) => <Tag color={r.color}>{v}</Tag> },
            { title: 'Sort', dataIndex: 'sort' },
            { title: 'Default', dataIndex: 'isDefault', render: (v: boolean) => v ? 'Yes' : '' },
            {
              title: '', key: 'del',
              render: (_: any, r: any) => (
                <Popconfirm title="Delete item?" onConfirm={() => handleDeleteItem(r.id)}>
                  <Button size="small" danger type="link">Delete</Button>
                </Popconfirm>
              ),
            },
          ]}
        />
        <Card size="small" style={{ marginTop: 16 }}>
          <Form form={itemForm} layout="inline" onFinish={handleAddItem}>
            <Form.Item name="value" rules={[{ required: true }]}><Input placeholder="Value" size="small" /></Form.Item>
            <Form.Item name="label" rules={[{ required: true }]}><Input placeholder="Label" size="small" /></Form.Item>
            <Form.Item name="color"><Input placeholder="Color" size="small" style={{ width: 80 }} /></Form.Item>
            <Form.Item name="sort" initialValue={0}><InputNumber placeholder="Sort" size="small" style={{ width: 60 }} /></Form.Item>
            <Form.Item><Button type="primary" size="small" htmlType="submit" icon={<PlusOutlined />}>Add</Button></Form.Item>
          </Form>
        </Card>
      </Modal>
    </div>
  );
};

export class PluginDataDictionaryClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('data-dictionary', {
      icon: 'BookOutlined',
      title: tval('Data Dictionary'),
      Component: DictionaryManager,
    });
  }
}

export default PluginDataDictionaryClient;

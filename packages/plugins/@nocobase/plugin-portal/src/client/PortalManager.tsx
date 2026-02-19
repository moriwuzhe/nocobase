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
  message, Typography, Card, Tabs, Divider, Badge, Avatar, List,
  ColorPicker, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined,
  UserOutlined, SettingOutlined, EyeOutlined, CopyOutlined,
} from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Portal Management page — full CRUD for portals + external user management.
 */
export const PortalManager: React.FC = () => {
  const api = useAPIClient();
  const [portals, setPortals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedPortal, setSelectedPortal] = useState<any>(null);
  const [externalUsers, setExternalUsers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [addUserVisible, setAddUserVisible] = useState(false);

  const fetchPortals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'portals:list',
        params: { appends: ['externalUsers'], sort: ['-createdAt'] },
      });
      setPortals(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchPortals(); }, [fetchPortals]);

  const handleSavePortal = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.request({
          url: `portals:update/${editing.id}`,
          method: 'POST',
          data: values,
        });
      } else {
        await api.request({
          url: 'portals:create',
          method: 'POST',
          data: values,
        });
      }
      message.success('Saved');
      setModalVisible(false);
      form.resetFields();
      setEditing(null);
      fetchPortals();
    } catch (err: any) {
      message.error(err.message || 'Save failed');
    }
  };

  const handleDeletePortal = async (id: string) => {
    await api.request({ url: `portals:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    fetchPortals();
  };

  const openUsersModal = async (portal: any) => {
    setSelectedPortal(portal);
    try {
      const res = await api.request({
        url: 'externalUsers:list',
        params: { filter: { portalId: portal.id }, sort: ['-createdAt'] },
      });
      setExternalUsers(res.data?.data || []);
    } catch { /* ignore */ }
    setUsersModalVisible(true);
  };

  const handleAddUser = async () => {
    const values = await userForm.validateFields();
    try {
      await api.request({
        url: 'externalUsers:create',
        method: 'POST',
        data: { ...values, portalId: selectedPortal.id },
      });
      message.success('User added');
      setAddUserVisible(false);
      userForm.resetFields();
      openUsersModal(selectedPortal);
    } catch (err: any) {
      message.error(err.message || 'Failed');
    }
  };

  const handleDeleteUser = async (id: string) => {
    await api.request({ url: `externalUsers:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    openUsersModal(selectedPortal);
  };

  const handleToggleUser = async (id: string, enabled: boolean) => {
    await api.request({
      url: `externalUsers:update/${id}`,
      method: 'POST',
      data: { enabled },
    });
    openUsersModal(selectedPortal);
  };

  const portalColumns = [
    {
      title: 'Portal',
      key: 'title',
      render: (_: any, r: any) => (
        <Space>
          <Avatar icon={<GlobalOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <div>
            <Text strong>{r.title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>/{r.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'URL',
      key: 'url',
      render: (_: any, r: any) => (
        <Space>
          <Text copyable code>/portal/{r.name}</Text>
          {r.customDomain && <Tag color="blue">{r.customDomain}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Users',
      key: 'users',
      render: (_: any, r: any) => (
        <Badge count={r.externalUsers?.length || 0} showZero>
          <Button size="small" icon={<UserOutlined />} onClick={() => openUsersModal(r)}>
            Manage
          </Button>
        </Badge>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (v: boolean) => v ? <Tag color="green">Active</Tag> : <Tag>Disabled</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/portal/${r.name}`, '_blank')}
          >
            Preview
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(r);
              form.setFieldsValue({
                ...r,
                brandingPrimaryColor: r.branding?.primaryColor,
                brandingLogoUrl: r.branding?.logoUrl,
              });
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm title="Delete this portal and all its users?" onConfirm={() => handleDeletePortal(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns = [
    { title: 'Nickname', dataIndex: 'nickname', key: 'nickname' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (v: string) => {
        const colors: Record<string, string> = { admin: 'red', member: 'blue', viewer: 'default' };
        return <Tag color={colors[v] || 'default'}>{v}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (v: boolean, r: any) => (
        <Switch size="small" checked={v} onChange={(checked) => handleToggleUser(r.id, checked)} />
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (v: string) => v ? new Date(v).toLocaleString() : 'Never',
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, r: any) => (
        <Popconfirm title="Remove this user?" onConfirm={() => handleDeleteUser(r.id)}>
          <Button size="small" danger type="link">Remove</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Portal Management</Title>
          <Text type="secondary">Create and manage external-facing portals for customers, suppliers, and partners.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}
        >
          New Portal
        </Button>
      </Space>

      <Table dataSource={portals} columns={portalColumns} rowKey="id" loading={loading} pagination={false} />

      {/* Portal Create/Edit Modal */}
      <Modal
        title={editing ? 'Edit Portal' : 'Create Portal'}
        open={modalVisible}
        onOk={handleSavePortal}
        onCancel={() => { setModalVisible(false); form.resetFields(); setEditing(null); }}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Tabs items={[
            {
              key: 'basic',
              label: 'Basic',
              children: (
                <>
                  <Form.Item name="name" label="URL Slug" rules={[{ required: true }, { pattern: /^[a-z0-9-]+$/, message: 'Lowercase letters, numbers, and hyphens only' }]}>
                    <Input placeholder="customer-portal" addonBefore="/portal/" disabled={!!editing} />
                  </Form.Item>
                  <Form.Item name="title" label="Portal Title" rules={[{ required: true }]}>
                    <Input placeholder="Customer Portal" />
                  </Form.Item>
                  <Form.Item name="description" label="Description">
                    <TextArea rows={2} placeholder="A portal for our customers to track their orders..." />
                  </Form.Item>
                  <Form.Item name="customDomain" label="Custom Domain (optional)">
                    <Input placeholder="portal.example.com" />
                  </Form.Item>
                  <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'branding',
              label: 'Branding',
              children: (
                <>
                  <Form.Item name={['branding', 'logoUrl']} label="Logo URL">
                    <Input placeholder="https://example.com/logo.png" />
                  </Form.Item>
                  <Form.Item name={['branding', 'primaryColor']} label="Primary Color">
                    <Input placeholder="#1677ff" />
                  </Form.Item>
                  <Form.Item name={['branding', 'customCss']} label="Custom CSS">
                    <TextArea rows={4} placeholder=".portal-header { background: #fff; }" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'auth',
              label: 'Authentication',
              children: (
                <>
                  <Form.Item name={['authConfig', 'allowEmailLogin']} label="Email Login" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                  <Form.Item name={['authConfig', 'allowPhoneLogin']} label="Phone Login" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                  <Form.Item name={['authConfig', 'allowSelfRegister']} label="Self Registration" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                  <Form.Item name={['authConfig', 'allowWechatLogin']} label="WeChat Login" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                </>
              ),
            },
          ]} />
        </Form>
      </Modal>

      {/* External Users Modal */}
      <Modal
        title={`Users — ${selectedPortal?.title || ''}`}
        open={usersModalVisible}
        onCancel={() => setUsersModalVisible(false)}
        width={900}
        footer={null}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { userForm.resetFields(); setAddUserVisible(true); }}>
            Add User
          </Button>
          <Text type="secondary">{externalUsers.length} user(s)</Text>
        </Space>
        <Table dataSource={externalUsers} columns={userColumns} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add External User"
        open={addUserVisible}
        onOk={handleAddUser}
        onCancel={() => { setAddUserVisible(false); userForm.resetFields(); }}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item name="nickname" label="Nickname" rules={[{ required: true }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="+86 138xxxx" />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input placeholder="Acme Corp" />
          </Form.Item>
          <Form.Item name="password" label="Initial Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="At least 6 characters" />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="member">
            <Input placeholder="admin / member / viewer" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

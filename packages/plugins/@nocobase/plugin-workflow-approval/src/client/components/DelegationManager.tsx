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
  Table, Button, Modal, Form, Input, Switch, DatePicker, Space,
  Tag, Popconfirm, message, Typography, Select,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { useT } from '../locale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * DelegationManager — manage approval delegation rules.
 * Allows users to delegate their approval authority to another user
 * during a specified time period (e.g. leave/travel).
 */
export const DelegationManager: React.FC = () => {
  const t = useT();
  const api = useAPIClient();
  const currentUser = useCurrentUserContext();
  const [delegations, setDelegations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchDelegations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'approvalDelegations:list',
        params: {
          filter: { delegatorId: currentUser?.data?.data?.id },
          sort: ['-createdAt'],
          appends: ['delegator', 'delegatee'],
        },
      });
      setDelegations(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api, currentUser]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.request({
        url: 'users:list',
        params: { fields: ['id', 'nickname', 'email'], pageSize: 200 },
      });
      setUsers(res.data?.data || []);
    } catch { /* ignore */ }
  }, [api]);

  useEffect(() => { fetchDelegations(); fetchUsers(); }, [fetchDelegations, fetchUsers]);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      const [startDate, endDate] = values.dateRange || [];
      await api.request({
        url: 'approvalDelegations:create',
        method: 'POST',
        data: {
          delegatorId: currentUser?.data?.data?.id,
          delegateeId: values.delegateeId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          reason: values.reason,
          enabled: true,
        },
      });
      message.success('Delegation created');
      setModalVisible(false);
      form.resetFields();
      fetchDelegations();
    } catch (err: any) {
      message.error(err.message || 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    await api.request({ url: `approvalDelegations:destroy/${id}`, method: 'POST' });
    message.success('Deleted');
    fetchDelegations();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await api.request({ url: `approvalDelegations:update/${id}`, method: 'POST', data: { enabled } });
    fetchDelegations();
  };

  const columns = [
    {
      title: t('Delegatee'),
      key: 'delegatee',
      render: (_: any, r: any) => (
        <Space>
          <SwapOutlined />
          <Text strong>{r.delegatee?.nickname || `User #${r.delegateeId}`}</Text>
        </Space>
      ),
    },
    {
      title: t('Start Date'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: t('End Date'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: 'Active',
      key: 'enabled',
      render: (_: any, r: any) => {
        const now = new Date();
        const isInRange = new Date(r.startDate) <= now && now <= new Date(r.endDate);
        return (
          <Space>
            <Switch size="small" checked={r.enabled} onChange={(v) => handleToggle(r.id, v)} />
            {r.enabled && isInRange && <Tag color="green">Active Now</Tag>}
            {r.enabled && !isInRange && <Tag color="orange">Scheduled</Tag>}
          </Space>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this delegation?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>{t('Delegation Rules')}</Title>
          <Text type="secondary">
            Delegate your approval tasks to another person during your absence.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>
          New Delegation
        </Button>
      </Space>

      <Table dataSource={delegations} columns={columns} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title="Create Delegation"
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="delegateeId" label={t('Delegatee')} rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select a user..."
              optionFilterProp="label"
              options={users
                .filter((u) => u.id !== currentUser?.data?.data?.id)
                .map((u) => ({ label: `${u.nickname} (${u.email || ''})`, value: u.id }))}
            />
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={2} placeholder="e.g. Business trip to Shanghai" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

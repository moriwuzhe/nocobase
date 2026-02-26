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
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty, Alert,
} from 'antd';
import {
  HomeOutlined, ToolOutlined, DollarOutlined, WarningOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'error' },
  assigned: { label: '已派单', color: 'processing' },
  in_progress: { label: '处理中', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
};

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [owners, setOwners] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ownerRes, repairRes, feeRes] = await Promise.all([
        api.request({ url: 'propOwners:list', params: { pageSize: 1 } }),
        api.request({ url: 'propRepairRequests:list', params: { pageSize: 200, sort: ['-createdAt'] } }),
        api.request({ url: 'propFees:list', params: { pageSize: 200 } }),
      ]);
      setOwners(ownerRes?.data?.data || []);
      setRepairs(repairRes?.data?.data || []);
      setFees(feeRes?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const totalOwners = owners.length;
  const pendingRepairs = repairs.filter((r) => ['pending', 'assigned'].includes(r.status)).length;
  const unpaidFees = fees.filter((f) => f.status !== 'paid');
  const unpaidAmount = unpaidFees.reduce((s, f) => s + (f.amount || 0), 0);
  const totalFeeAmount = fees.reduce((s, f) => s + (f.amount || 0), 0);

  const repairColumns = [
    { title: '工单号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '报修内容', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '类别', dataIndex: 'category', key: 'category' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; },
    },
    { title: '报修日期', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><HomeOutlined style={{ marginRight: 8 }} />物业管理仪表盘</Title>
      {pendingRepairs > 0 && <Alert message={`${pendingRepairs} 个报修工单待处理`} type="warning" showIcon style={{ marginBottom: 16 }} />}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="业主/住户" value={totalOwners} prefix={<UserOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待处理报修" value={pendingRepairs} prefix={<ToolOutlined style={{ color: pendingRepairs > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: pendingRepairs > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待缴费用" value={unpaidFees.length} prefix={<WarningOutlined style={{ color: unpaidFees.length > 0 ? '#fa8c16' : '#52c41a' }} />} valueStyle={{ color: unpaidFees.length > 0 ? '#fa8c16' : undefined }} suffix="笔" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待收金额" value={unpaidAmount} prefix={<DollarOutlined style={{ color: '#722ed1' }} />} precision={2} formatter={(v) => `¥${(v as number).toLocaleString()}`} /></Card></Col>
      </Row>
      <Card title="最新报修工单" size="small">
        <Table dataSource={repairs.slice(0, 10)} columns={repairColumns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export class PluginPropertyTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('property-template', { icon: 'HomeOutlined', title: tval('Property'), Component: Dashboard });
  }
}
export default PluginPropertyTemplateClient;

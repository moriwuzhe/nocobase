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
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty,
} from 'antd';
import {
  ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待审批', color: 'processing' },
  approved: { label: '已审批', color: 'blue' },
  ordered: { label: '已下单', color: 'orange' },
  received: { label: '已收货', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  cancelled: { label: '已取消', color: 'default' },
};

const fmt = (v: number) => (v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`);

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'procPurchaseOrders:list',
        params: { pageSize: 200, sort: ['-createdAt'], appends: ['supplier'] },
      });
      setOrders(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = orders.length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const inProcess = orders.filter((o) => ['approved', 'ordered'].includes(o.status)).length;
  const totalAmount = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const columns = [
    { title: '采购单号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier', ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => v ? fmt(v) : '-', align: 'right' as const },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '日期', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><ShoppingCartOutlined style={{ marginRight: 8 }} />采购管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="采购单总数" value={total} prefix={<ShoppingCartOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待审批" value={pending} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: pending > 0 ? '#fa8c16' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="处理中" value={inProcess} prefix={<AuditOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="采购总额" value={totalAmount} formatter={(v) => fmt(v as number)} prefix={<DollarOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
      </Row>
      <Card title="最新采购单" size="small">
        <Table dataSource={orders.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export class PluginProcurementTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('procurement-template', { icon: 'ShoppingCartOutlined', title: tval('Procurement'), Component: Dashboard });
  }
}
export default PluginProcurementTemplateClient;

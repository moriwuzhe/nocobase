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
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty, Progress,
} from 'antd';
import {
  ShopOutlined, DollarOutlined, ShoppingOutlined, TruckOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: 'default' },
  paid: { label: '已付款', color: 'blue' },
  processing: { label: '处理中', color: 'processing' },
  shipped: { label: '已发货', color: 'orange' },
  delivered: { label: '已送达', color: 'cyan' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'default' },
  refunded: { label: '已退款', color: 'error' },
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
        url: 'ecOrders:list',
        params: { pageSize: 200, sort: ['-createdAt'] },
      });
      setOrders(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = orders.length;
  const totalRevenue = orders.filter((o) => !['cancelled', 'refunded'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingShip = orders.filter((o) => ['paid', 'processing'].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === 'completed').length;

  const now = new Date();
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.toDateString() === now.toDateString();
  });
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => v ? fmt(v) : '-', align: 'right' as const },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><ShopOutlined style={{ marginRight: 8 }} />电商订单仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="订单总数" value={total} prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="总营收" value={totalRevenue} formatter={(v) => fmt(v as number)} prefix={<DollarOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待发货" value={pendingShip} prefix={<TruckOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: pendingShip > 0 ? '#fa8c16' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="今日营收" value={todayRevenue} formatter={(v) => fmt(v as number)} prefix={<RiseOutlined style={{ color: '#722ed1' }} />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="订单状态分布" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(STATUS_MAP).map(([key, s]) => {
                const count = orders.filter((o) => o.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tag color={s.color}>{s.label}</Tag>
                    <Text strong>{count}</Text>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新订单" size="small" style={{ height: '100%' }}>
            <Table dataSource={orders.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginEcommerceTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('ecommerce-template', { icon: 'ShopOutlined', title: tval('E-commerce'), Component: Dashboard });
  }
}
export default PluginEcommerceTemplateClient;

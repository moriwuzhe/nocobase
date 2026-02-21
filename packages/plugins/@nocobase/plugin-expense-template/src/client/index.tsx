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
  AccountBookOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待审批', color: 'processing' },
  approved: { label: '已审批', color: 'blue' },
  rejected: { label: '已驳回', color: 'error' },
  paid: { label: '已报销', color: 'success' },
};

const fmt = (v: number) => (v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`);

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'expenseClaims:list',
        params: { pageSize: 200, sort: ['-createdAt'], appends: ['applicant'] },
      });
      setClaims(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = claims.length;
  const pending = claims.filter((c) => c.status === 'pending').length;
  const totalAmount = claims.reduce((s, c) => s + (c.totalAmount || 0), 0);
  const paidAmount = claims.filter((c) => c.status === 'paid').reduce((s, c) => s + (c.totalAmount || 0), 0);
  const thisMonth = claims.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonth.reduce((s, c) => s + (c.totalAmount || 0), 0);

  const columns = [
    { title: '报销单号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '摘要', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => v ? fmt(v) : '-', align: 'right' as const },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '日期', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><AccountBookOutlined style={{ marginRight: 8 }} />报销管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="报销单总数" value={total} prefix={<AccountBookOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待审批" value={pending} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: pending > 0 ? '#fa8c16' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="报销总额" value={totalAmount} formatter={(v) => fmt(v as number)} prefix={<DollarOutlined style={{ color: '#722ed1' }} />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="本月报销" value={thisMonthAmount} formatter={(v) => fmt(v as number)} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="报销统计" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {Object.entries(STATUS_MAP).map(([key, s]) => {
                const count = claims.filter((c) => c.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tag color={s.color}>{s.label}</Tag>
                    <Text strong>{count} 笔</Text>
                  </div>
                );
              })}
              {totalAmount > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">已报销比例</Text>
                  <Progress percent={Math.round((paidAmount / totalAmount) * 100)} strokeColor="#52c41a" />
                </div>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新报销单" size="small" style={{ height: '100%' }}>
            <Table dataSource={claims.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginExpenseTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('expense-template', { icon: 'AccountBookOutlined', title: tval('Expenses'), Component: Dashboard });
  }
}
export default PluginExpenseTemplateClient;

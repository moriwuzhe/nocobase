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
  FileProtectOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  pending_review: { label: '待审批', color: 'processing' },
  approved: { label: '已审批', color: 'blue' },
  signed: { label: '已签署', color: 'green' },
  active: { label: '执行中', color: 'success' },
  expired: { label: '已到期', color: 'warning' },
  terminated: { label: '已终止', color: 'error' },
};

const fmt = (v: number) => (v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`);

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'contracts:list',
        params: { pageSize: 200, sort: ['-createdAt'], appends: ['owner'] },
      });
      setContracts(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = contracts.length;
  const active = contracts.filter((c) => ['active', 'signed'].includes(c.status)).length;
  const totalAmount = contracts.reduce((s, c) => s + (c.amount || 0), 0);
  const paidAmount = contracts.reduce((s, c) => s + (c.paidAmount || 0), 0);
  const expiringSoon = contracts.filter((c) => {
    if (!c.endDate || !['active', 'signed'].includes(c.status)) return false;
    const d = new Date(c.endDate).getTime() - Date.now();
    return d > 0 && d < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const byStatus: Record<string, number> = {};
  contracts.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

  const columns = [
    { title: '合同编号', dataIndex: 'code', key: 'code', width: 140 },
    { title: '合同名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => v ? fmt(v) : '-', align: 'right' as const },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '到期日', dataIndex: 'endDate', key: 'endDate', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><FileProtectOutlined style={{ marginRight: 8 }} />合同管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="合同总数" value={total} prefix={<FileProtectOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="执行中" value={active} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="合同总额" value={totalAmount} formatter={(v) => fmt(v as number)} prefix={<DollarOutlined style={{ color: '#fa8c16' }} />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="即将到期" value={expiringSoon} prefix={<WarningOutlined style={{ color: expiringSoon > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: expiringSoon > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="状态分布" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(byStatus).map(([status, count]) => {
                const s = STATUS_MAP[status];
                return (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={s?.color}>{s?.label || status}</Tag>
                    <Space><Text strong>{count}</Text><Text type="secondary">({total ? Math.round((count / total) * 100) : 0}%)</Text></Space>
                  </div>
                );
              })}
            </Space>
            {totalAmount > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">回款进度</Text>
                <Progress percent={Math.round((paidAmount / totalAmount) * 100)} format={(p) => `${p}%`} />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新合同" size="small" style={{ height: '100%' }}>
            <Table dataSource={contracts.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginContractTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('contract-template', { icon: 'FileProtectOutlined', title: tval('Contracts'), Component: Dashboard });
  }
}
export default PluginContractTemplateClient;

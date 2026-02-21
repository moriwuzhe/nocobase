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
  FileTextOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined,
  WarningOutlined, AlertOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: '待处理', color: 'error' },
  in_progress: { label: '处理中', color: 'processing' },
  waiting_customer: { label: '等待反馈', color: 'warning' },
  resolved: { label: '已解决', color: 'success' },
  closed: { label: '已关闭', color: 'default' },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' },
  urgent: { label: '紧急', color: 'red' },
};

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [kbCount, setKbCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tickRes, kbRes] = await Promise.all([
        api.request({ url: 'tickets:list', params: { pageSize: 200, sort: ['-createdAt'], appends: ['assignee'] } }),
        api.request({ url: 'ticketKnowledgeBase:list', params: { pageSize: 1 } }),
      ]);
      setTickets(tickRes?.data?.data || []);
      setKbCount(kbRes?.data?.meta?.count || kbRes?.data?.data?.length || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const resolved = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;
  const urgent = tickets.filter((t) => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length;

  const avgResolutionHours = (() => {
    const resolvedTickets = tickets.filter((t) => t.resolutionHours);
    if (resolvedTickets.length === 0) return 0;
    return Math.round(resolvedTickets.reduce((s, t) => s + t.resolutionHours, 0) / resolvedTickets.length * 10) / 10;
  })();

  const columns = [
    { title: '工单号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority',
      render: (v: string) => { const p = PRIORITY_MAP[v]; return p ? <Tag color={p.color}>{p.label}</Tag> : <Tag>{v}</Tag>; },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; },
    },
    { title: '负责人', dataIndex: ['assignee', 'nickname'], key: 'assignee' },
    { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><FileTextOutlined style={{ marginRight: 8 }} />工单系统仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="待处理" value={open} prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: open > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="处理中" value={inProgress} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="已解决" value={resolved} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="紧急工单" value={urgent} prefix={<AlertOutlined style={{ color: urgent > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: urgent > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="平均解决" value={avgResolutionHours} suffix="小时" /></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card size="small"><Statistic title="知识库" value={kbCount} prefix={<BookOutlined style={{ color: '#1677ff' }} />} suffix="篇" /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="工单状态" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(STATUS_MAP).map(([key, s]) => {
                const count = tickets.filter((t) => t.status === key).length;
                if (count === 0) return null;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Tag color={s.color}>{s.label}</Tag>
                      <Text>{count} ({pct}%)</Text>
                    </div>
                    <Progress percent={pct} showInfo={false} strokeColor={s.color === 'default' ? '#d9d9d9' : s.color} size="small" />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新工单" size="small" style={{ height: '100%' }}>
            <Table dataSource={tickets.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginTicketTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('ticket-template', { icon: 'FileTextOutlined', title: tval('Helpdesk'), Component: Dashboard });
  }
}
export default PluginTicketTemplateClient;

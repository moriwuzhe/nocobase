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
  CustomerServiceOutlined, ClockCircleOutlined, CheckCircleOutlined,
  WarningOutlined, ToolOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: '待处理', color: 'default' },
  in_progress: { label: '处理中', color: 'processing' },
  waiting_parts: { label: '等待配件', color: 'warning' },
  resolved: { label: '已解决', color: 'success' },
  closed: { label: '已关闭', color: 'default' },
};

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'serviceRequests:list',
        params: { pageSize: 200, sort: ['-createdAt'] },
      });
      setRequests(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = requests.length;
  const open = requests.filter((r) => r.status === 'open').length;
  const inProgress = requests.filter((r) => r.status === 'in_progress').length;
  const resolved = requests.filter((r) => r.status === 'resolved').length;

  const columns = [
    { title: '工单号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => { const s = STATUS_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><CustomerServiceOutlined style={{ marginRight: 8 }} />售后服务仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="工单总数" value={total} prefix={<ToolOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="待处理" value={open} prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: open > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="处理中" value={inProgress} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="已解决" value={resolved} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      <Card title="最新售后工单" size="small">
        <Table dataSource={requests.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export class PluginServiceTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('service-template', { icon: 'CustomerServiceOutlined', title: tval('After-sales'), Component: Dashboard });
  }
}
export default PluginServiceTemplateClient;

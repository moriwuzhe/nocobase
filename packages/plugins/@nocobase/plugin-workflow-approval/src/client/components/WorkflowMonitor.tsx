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
  Progress, Alert, Button, Tooltip,
} from 'antd';
import {
  ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, BarChartOutlined, ReloadOutlined,
  WarningOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Title, Text } = Typography;

const EXEC_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '已创建', color: 'default' },
  1: { label: '运行中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  [-1]: { label: '失败', color: 'error' },
  [-2]: { label: '已取消', color: 'warning' },
  [-3]: { label: '已拒绝', color: 'orange' },
  [-4]: { label: '超时', color: 'red' },
};

export const WorkflowMonitor: React.FC = () => {
  const api = useAPIClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'workflowMonitor:stats' });
      setData(res?.data?.data || null);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!data) return <Empty description="暂无工作流数据" />;

  const successRate = data.totalExecutions > 0
    ? Math.round(((data.totalExecutions - data.errorExecutions) / data.totalExecutions) * 100)
    : 100;

  const errorColumns = [
    { title: '工作流', dataIndex: 'workflowTitle', key: 'wf', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: number) => {
        const s = EXEC_STATUS_MAP[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag color="red">{v}</Tag>;
      },
    },
    {
      title: '时间', dataIndex: 'createdAt', key: 'time',
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
  ];

  const topColumns = [
    { title: '工作流', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '执行次数', dataIndex: 'count', key: 'count', align: 'right' as const },
    { title: '错误次数', dataIndex: 'errors', key: 'errors', align: 'right' as const,
      render: (v: number) => v > 0 ? <Text type="danger">{v}</Text> : <Text type="secondary">0</Text>,
    },
    {
      title: '成功率', key: 'rate',
      render: (_: any, r: any) => {
        const rate = r.count > 0 ? Math.round(((r.count - r.errors) / r.count) * 100) : 100;
        return <Progress percent={rate} size="small" style={{ width: 80 }} strokeColor={rate < 80 ? '#ff4d4f' : '#52c41a'} />;
      },
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          工作流执行监控
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>刷新</Button>
      </div>

      {data.errorExecutions > 0 && (
        <Alert
          message={`最近有 ${data.errorExecutions} 次工作流执行失败`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="工作流总数" value={data.totalWorkflows} prefix={<ThunderboltOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="已启用" value={data.enabledWorkflows} prefix={<PlayCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="总执行次数" value={data.totalExecutions} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="今日执行" value={data.todayExecutions} prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="失败次数" value={data.errorExecutions} prefix={<CloseCircleOutlined style={{ color: data.errorExecutions > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: data.errorExecutions > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic title="成功率" value={successRate} suffix="%" prefix={<CheckCircleOutlined style={{ color: successRate >= 95 ? '#52c41a' : '#fa8c16' }} />} valueStyle={{ color: successRate >= 95 ? '#52c41a' : '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="执行次数 Top 10" size="small" style={{ height: '100%' }}>
            {(data.topWorkflows || []).length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无执行记录" />
            ) : (
              <Table dataSource={data.topWorkflows} columns={topColumns} rowKey="title" size="small" pagination={false} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最近错误" size="small" style={{ height: '100%' }}>
            {(data.recentErrors || []).length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无错误记录" />
            ) : (
              <Table dataSource={data.recentErrors} columns={errorColumns} rowKey="id" size="small" pagination={false} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

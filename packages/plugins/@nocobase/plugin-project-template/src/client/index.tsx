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
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Progress,
  Table,
  Spin,
  Empty,
  Badge,
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  todo: { label: '待办', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  in_review: { label: '评审中', color: 'warning' },
  done: { label: '已完成', color: 'success' },
  blocked: { label: '已阻塞', color: 'error' },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' },
  urgent: { label: '紧急', color: 'red' },
};

const ProjectDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.request({ url: 'pmDashboard:stats' }).catch(() => null),
        api.request({
          url: 'pmTasks:list',
          params: { pageSize: 10, sort: ['-createdAt'], appends: ['project', 'assignee'] },
        }).catch(() => null),
      ]);
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (tasksRes?.data?.data) setRecentTasks(tasksRes.data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!stats) {
    return <div style={{ padding: 48 }}><Empty description="暂无数据，请先创建项目" /></div>;
  }

  const taskColumns = [
    { title: '任务', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '项目', dataIndex: ['project', 'name'], key: 'project', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const s = STATUS_MAP[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (v: string) => {
        const p = PRIORITY_MAP[v];
        return p ? <Tag color={p.color}>{p.label}</Tag> : <Tag>{v}</Tag>;
      },
    },
    { title: '负责人', dataIndex: ['assignee', 'nickname'], key: 'assignee' },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (v: number) => <Progress percent={v || 0} size="small" style={{ width: 80 }} />,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <ProjectOutlined style={{ marginRight: 8 }} />
        项目管理仪表盘
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="项目总数" value={stats.totalProjects} prefix={<ProjectOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="进行中" value={stats.activeProjects} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="已完成" value={stats.completedProjects} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="逾期任务" value={stats.overdueTasks} prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: stats.overdueTasks > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="任务状态分布" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(stats.tasksByStatus || {}).map(([status, count]) => {
                const s = STATUS_MAP[status];
                const percent = stats.totalTasks ? Math.round(((count as number) / stats.totalTasks) * 100) : 0;
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <Badge color={s?.color === 'default' ? '#d9d9d9' : s?.color || '#1677ff'} />
                        <Text>{s?.label || status}</Text>
                      </Space>
                      <Text strong>{count as number} 个 ({percent}%)</Text>
                    </div>
                    <Progress percent={percent} showInfo={false} strokeColor={s?.color === 'default' ? '#d9d9d9' : s?.color} size="small" />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="项目进度概览" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div style={{ textAlign: 'center' }}>
                <Progress type="dashboard" percent={stats.avgProgress} format={(p) => `${p}%`} />
                <div><Text type="secondary">平均项目进度</Text></div>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="总预算" value={stats.totalBudget} prefix="¥" precision={0} />
                </Col>
                <Col span={12}>
                  <Statistic title="实际花费" value={stats.totalCost} prefix="¥" precision={0} />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="最新任务" size="small">
        <Table
          dataSource={recentTasks}
          columns={taskColumns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export class PluginProjectTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('plugin-project-template', {
      icon: 'ProjectOutlined',
      title: tval('Project Management'),
      Component: ProjectDashboard,
    });
  }
}

export default PluginProjectTemplateClient;

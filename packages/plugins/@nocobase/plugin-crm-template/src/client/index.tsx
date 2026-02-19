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
  Divider,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  PhoneOutlined,
  RiseOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FundOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

interface CrmStats {
  totalCustomers: number;
  totalContacts: number;
  totalDeals: number;
  totalActivities: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalPipeline: number;
  totalWon: number;
  weightedPipeline: number;
  winRate: number;
  stageBreakdown: Record<string, { count: number; amount: number }>;
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  qualification: { label: '线索确认', color: '#8c8c8c' },
  needs_analysis: { label: '需求分析', color: '#1677ff' },
  proposal: { label: '方案报价', color: '#722ed1' },
  negotiation: { label: '商务谈判', color: '#fa8c16' },
  closed_won: { label: '已成交', color: '#52c41a' },
  closed_lost: { label: '已流失', color: '#ff4d4f' },
};

const formatCurrency = (val: number): string => {
  if (val >= 10000) {
    return `¥${(val / 10000).toFixed(1)}万`;
  }
  return `¥${val.toLocaleString()}`;
};

const CrmDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, dealsRes] = await Promise.all([
        api.request({ url: 'crmDashboard:stats' }).catch(() => null),
        api.request({
          url: 'crmDeals:list',
          params: {
            pageSize: 10,
            sort: ['-createdAt'],
            appends: ['customer', 'owner'],
          },
        }).catch(() => null),
      ]);

      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
      if (dealsRes?.data?.data) {
        setRecentDeals(dealsRes.data.data);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 48 }}>
        <Empty description="暂无数据，请先添加客户和商机" />
      </div>
    );
  }

  const pipelineStages = Object.entries(stats.stageBreakdown || {})
    .filter(([stage]) => !['closed_won', 'closed_lost'].includes(stage))
    .map(([stage, data]) => ({
      stage,
      ...STAGE_LABELS[stage],
      ...data,
    }));

  const maxPipelineAmount = Math.max(...pipelineStages.map((s) => s.amount), 1);

  const dealColumns = [
    {
      title: '商机名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '客户',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => (val ? formatCurrency(val) : '-'),
      align: 'right' as const,
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (val: string) => {
        const s = STAGE_LABELS[val];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{val}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: ['owner', 'nickname'],
      key: 'owner',
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <FundOutlined style={{ marginRight: 8 }} />
        CRM 仪表盘
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="销售管道金额"
              value={stats.totalPipeline}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              formatter={(val) => formatCurrency(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已成交金额"
              value={stats.totalWon}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(val) => formatCurrency(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="赢单率"
              value={stats.winRate}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="联系人" value={stats.totalContacts} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="进行中商机" value={stats.openDeals} prefix={<PieChartOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="加权管道"
              value={stats.weightedPipeline}
              formatter={(val) => formatCurrency(val as number)}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="跟进活动" value={stats.totalActivities} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Pipeline Funnel */}
        <Col xs={24} lg={10}>
          <Card title="销售管道" size="small" style={{ height: '100%' }}>
            {pipelineStages.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无进行中的商机" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {pipelineStages.map((s) => (
                  <div key={s.stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <Tag color={s.color}>{s.label}</Tag>
                        <Text type="secondary">{s.count} 个</Text>
                      </Space>
                      <Text strong>{formatCurrency(s.amount)}</Text>
                    </div>
                    <Progress
                      percent={Math.round((s.amount / maxPipelineAmount) * 100)}
                      showInfo={false}
                      strokeColor={s.color}
                      size="small"
                    />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        {/* Recent Deals */}
        <Col xs={24} lg={14}>
          <Card title="最新商机" size="small" style={{ height: '100%' }}>
            <Table
              dataSource={recentDeals}
              columns={dealColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginCrmTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('crm-template', {
      icon: 'TeamOutlined',
      title: tval('CRM'),
      Component: CrmDashboard,
    });
  }
}

export default PluginCrmTemplateClient;

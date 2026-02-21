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
  Descriptions,
  Spin,
  Button,
  Tooltip,
} from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
  HddOutlined,
} from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Title, Text } = Typography;

interface SystemStatusData {
  version: string;
  uptime: number;
  uptimeFormatted: string;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  database: { dialect: string; collectionsCount: number };
  plugins: { total: number; enabled: number };
  workflows: { total: number; enabled: number };
  users: number;
  node: string;
  platform: string;
}

export const SystemStatus: React.FC = () => {
  const api = useAPIClient();
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'systemStatus:get' });
      setData(res?.data?.data || null);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading && !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  const heapPercent = data.memory.heapTotal > 0
    ? Math.round((data.memory.heapUsed / data.memory.heapTotal) * 100)
    : 0;

  const dialectLabel: Record<string, string> = {
    postgres: 'PostgreSQL',
    mysql: 'MySQL',
    mariadb: 'MariaDB',
    sqlite: 'SQLite',
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <DashboardOutlined style={{ marginRight: 8 }} />
          系统状态
        </Title>
        <Tooltip title="刷新">
          <Button icon={<ReloadOutlined />} onClick={fetchStatus} loading={loading}>
            刷新
          </Button>
        </Tooltip>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic
              title="运行时间"
              value={data.uptimeFormatted}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic
              title="内存使用"
              value={data.memory.heapUsed}
              suffix={`/ ${data.memory.heapTotal} MB`}
              prefix={<HddOutlined style={{ color: heapPercent > 80 ? '#ff4d4f' : '#1677ff' }} />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic
              title="启用插件"
              value={data.plugins.enabled}
              suffix={`/ ${data.plugins.total}`}
              prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic
              title="用户数"
              value={data.users}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="服务器信息" size="small">
            <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="NocoBase 版本">
                <Tag color="blue">v{data.version}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Node.js 版本">
                <Tag>{data.node}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作系统">
                <Tag>{data.platform}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据库类型">
                <Tag color="green">{dialectLabel[data.database.dialect] || data.database.dialect}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据表数量">
                {data.database.collectionsCount}
              </Descriptions.Item>
              <Descriptions.Item label="RSS 内存">
                {data.memory.rss} MB
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="资源使用" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>堆内存使用率</Text>
                  <Text strong>{heapPercent}%</Text>
                </div>
                <Progress
                  percent={heapPercent}
                  strokeColor={heapPercent > 80 ? '#ff4d4f' : heapPercent > 60 ? '#faad14' : '#52c41a'}
                  showInfo={false}
                />
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title="工作流总数"
                      value={data.workflows.total}
                      prefix={<NodeIndexOutlined />}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title="启用工作流"
                      value={data.workflows.enabled}
                      prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ fontSize: 18, color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

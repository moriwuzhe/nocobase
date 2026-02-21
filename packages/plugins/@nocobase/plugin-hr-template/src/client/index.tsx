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
  Table,
  Progress,
  Spin,
  Empty,
  Badge,
} from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  probation: { label: '试用期', color: 'warning' },
  active: { label: '在职', color: 'success' },
  on_leave: { label: '休假中', color: 'processing' },
  resigned: { label: '已离职', color: 'default' },
  terminated: { label: '已终止', color: 'error' },
};

const HrDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<any>(null);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, empRes] = await Promise.all([
        api.request({ url: 'hrDashboard:stats' }).catch(() => null),
        api.request({
          url: 'hrEmployees:list',
          params: { pageSize: 10, sort: ['-createdAt'], filter: { status: { $ne: 'resigned' } } },
        }).catch(() => null),
      ]);
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (empRes?.data?.data) setRecentEmployees(empRes.data.data);
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
    return <div style={{ padding: 48 }}><Empty description="暂无数据" /></div>;
  }

  const empColumns = [
    { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 100 },
    { title: '姓名', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '职位', dataIndex: 'position', key: 'position', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const s = STATUS_MAP[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
      },
    },
  ];

  const deptEntries = Object.entries(stats.byDepartment || {}).sort(
    (a, b) => (b[1] as number) - (a[1] as number),
  );
  const maxDeptCount = Math.max(...deptEntries.map(([, c]) => c as number), 1);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        人事管理仪表盘
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="在职员工"
              value={stats.activeCount}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
              suffix={<Text type="secondary" style={{ fontSize: 14 }}>/ {stats.totalEmployees}</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="试用期"
              value={stats.probationCount}
              prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="待审批请假"
              value={stats.pendingLeaves}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: stats.pendingLeaves > 0 ? '#722ed1' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本月入职"
              value={stats.newHiresThisMonth}
              prefix={<UserAddOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card title="部门人数分布" size="small" style={{ height: '100%' }}>
            {deptEntries.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无部门数据" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {deptEntries.map(([dept, count]) => (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{dept}</Text>
                      <Text strong>{count as number} 人</Text>
                    </div>
                    <Progress
                      percent={Math.round(((count as number) / maxDeptCount) * 100)}
                      showInfo={false}
                      strokeColor="#1677ff"
                      size="small"
                    />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="员工列表" size="small" style={{ height: '100%' }}>
            <Table
              dataSource={recentEmployees}
              columns={empColumns}
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

export class PluginHrTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('hr-template', {
      icon: 'TeamOutlined',
      title: tval('HR'),
      Component: HrDashboard,
    });
  }
}

export default PluginHrTemplateClient;

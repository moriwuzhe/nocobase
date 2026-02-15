/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { TeamOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const HrDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ employees: 0, leaveRequests: 0, attendance: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [empRes, leaveRes, attRes] = await Promise.all([
          api.request({ url: 'hrEmployees:list', params: { pageSize: 1 } }),
          api.request({ url: 'hrLeaveRequests:list', params: { filter: { status: 'pending' }, pageSize: 1 } }),
          api.request({ url: 'hrAttendance:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          employees: empRes.data?.meta?.count || empRes.data?.data?.length || 0,
          leaveRequests: leaveRes.data?.meta?.count || leaveRes.data?.data?.length || 0,
          attendance: attRes.data?.meta?.count || attRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>HR Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card hoverable><Statistic title="Employees" value={stats.employees} prefix={<TeamOutlined style={{ color: '#1677ff' }} />} /></Card>
        </Col>
        <Col span={8}>
          <Card hoverable><Statistic title="Pending Leave Requests" value={stats.leaveRequests} prefix={<FileTextOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col span={8}>
          <Card hoverable><Statistic title="Attendance Records" value={stats.attendance} prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />} /></Card>
        </Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space>
          <Button icon={<TeamOutlined />}>Add Employee</Button>
          <Button icon={<FileTextOutlined />}>New Leave Request</Button>
          <Button icon={<ClockCircleOutlined />}>Record Attendance</Button>
        </Space>
      </Card>
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

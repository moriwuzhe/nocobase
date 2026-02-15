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
import { NotificationOutlined, VideoCameraOutlined, CalendarOutlined, LaptopOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const OaDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ announcements: 0, rooms: 0, bookings: 0, assets: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [annRes, roomRes, bookRes, assetRes] = await Promise.all([
          api.request({ url: 'oaAnnouncements:list', params: { filter: { status: 'published' }, pageSize: 1 } }),
          api.request({ url: 'oaMeetingRooms:list', params: { pageSize: 1 } }),
          api.request({ url: 'oaMeetingBookings:list', params: { filter: { status: 'confirmed' }, pageSize: 1 } }),
          api.request({ url: 'oaAssets:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          announcements: annRes.data?.meta?.count || annRes.data?.data?.length || 0,
          rooms: roomRes.data?.meta?.count || roomRes.data?.data?.length || 0,
          bookings: bookRes.data?.meta?.count || bookRes.data?.data?.length || 0,
          assets: assetRes.data?.meta?.count || assetRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>OA Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card hoverable><Statistic title="Announcements" value={stats.announcements} prefix={<NotificationOutlined style={{ color: '#1677ff' }} />} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="Meeting Rooms" value={stats.rooms} prefix={<VideoCameraOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="Active Bookings" value={stats.bookings} prefix={<CalendarOutlined style={{ color: '#faad14' }} />} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="Assets" value={stats.assets} prefix={<LaptopOutlined style={{ color: '#722ed1' }} />} /></Card></Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space>
          <Button icon={<NotificationOutlined />}>New Announcement</Button>
          <Button icon={<CalendarOutlined />}>Book Meeting</Button>
          <Button icon={<LaptopOutlined />}>Register Asset</Button>
        </Space>
      </Card>
    </div>
  );
};

export class PluginOaTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('oa-template', {
      icon: 'DesktopOutlined',
      title: tval('OA'),
      Component: OaDashboard,
    });
  }
}

export default PluginOaTemplateClient;

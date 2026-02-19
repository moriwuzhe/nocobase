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
  Spin,
  Empty,
  List,
} from 'antd';
import {
  NotificationOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  LaptopOutlined,
  UserSwitchOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text, Paragraph } = Typography;

const OaDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const [statsRes, annRes, bookRes] = await Promise.all([
        api.request({ url: 'oaDashboard:stats' }).catch(() => null),
        api.request({
          url: 'oaAnnouncements:list',
          params: {
            filter: { status: 'published' },
            pageSize: 5,
            sort: ['-publishedAt'],
          },
        }).catch(() => null),
        api.request({
          url: 'oaMeetingBookings:list',
          params: {
            filter: {
              startTime: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
              status: { $ne: 'cancelled' },
            },
            pageSize: 10,
            sort: ['startTime'],
            appends: ['room', 'organizer'],
          },
        }).catch(() => null),
      ]);

      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (annRes?.data?.data) setAnnouncements(annRes.data.data);
      if (bookRes?.data?.data) setTodayBookings(bookRes.data.data);
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

  const bookingColumns = [
    {
      title: '时间',
      key: 'time',
      render: (_: any, record: any) => {
        const start = record.startTime ? new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
        const end = record.endTime ? new Date(record.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
        return `${start} - ${end}`;
      },
    },
    { title: '会议室', dataIndex: ['room', 'name'], key: 'room' },
    { title: '主题', dataIndex: 'subject', key: 'subject', ellipsis: true },
    { title: '组织者', dataIndex: ['organizer', 'nickname'], key: 'organizer' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = {
          confirmed: { label: '已确认', color: 'green' },
          pending: { label: '待确认', color: 'orange' },
          cancelled: { label: '已取消', color: 'default' },
        };
        const s = map[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <DesktopOutlined style={{ marginRight: 8 }} />
        OA 办公仪表盘
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="公告" value={stats.activeAnnouncements} prefix={<NotificationOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="会议室" value={stats.totalMeetingRooms} prefix={<VideoCameraOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="今日会议" value={stats.todayBookings} prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="固定资产" value={stats.totalAssets} prefix={<LaptopOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="今日访客" value={stats.todayVisitors} prefix={<UserSwitchOutlined style={{ color: '#13c2c2' }} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card title="最新公告" size="small" style={{ height: '100%' }}>
            {announcements.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无公告" />
            ) : (
              <List
                dataSource={announcements}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          {item.priority === 'urgent' && <Tag color="red">紧急</Tag>}
                          {item.priority === 'important' && <Tag color="orange">重要</Tag>}
                          <Text strong>{item.title}</Text>
                        </Space>
                      }
                      description={
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 0, fontSize: 12, color: '#999' }}
                        >
                          {item.content?.replace(/<[^>]*>/g, '').slice(0, 100)}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="今日会议安排" size="small" style={{ height: '100%' }}>
            {todayBookings.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="今日暂无会议" />
            ) : (
              <Table
                dataSource={todayBookings}
                columns={bookingColumns}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>
        </Col>
      </Row>
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

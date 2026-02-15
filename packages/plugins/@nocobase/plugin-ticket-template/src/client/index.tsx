import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { FileTextOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const TicketDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, articles: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [openRes, progRes, resRes, kbRes] = await Promise.all([
          api.request({ url: 'tickets:list', params: { filter: { status: 'open' }, pageSize: 1 } }),
          api.request({ url: 'tickets:list', params: { filter: { status: 'in_progress' }, pageSize: 1 } }),
          api.request({ url: 'tickets:list', params: { filter: { status: 'resolved' }, pageSize: 1 } }),
          api.request({ url: 'ticketKnowledgeBase:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          open: openRes.data?.meta?.count || openRes.data?.data?.length || 0,
          inProgress: progRes.data?.meta?.count || progRes.data?.data?.length || 0,
          resolved: resRes.data?.meta?.count || resRes.data?.data?.length || 0,
          articles: kbRes.data?.meta?.count || kbRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Helpdesk Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card hoverable><Statistic title="Open Tickets" value={stats.open} prefix={<FileTextOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="In Progress" value={stats.inProgress} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="Resolved" value={stats.resolved} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="KB Articles" value={stats.articles} prefix={<BookOutlined style={{ color: '#1677ff' }} />} /></Card></Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space><Button icon={<FileTextOutlined />}>New Ticket</Button><Button icon={<BookOutlined />}>New Article</Button></Space>
      </Card>
    </div>
  );
};

export class PluginTicketTemplateClient extends Plugin {
  async load() { this.app.pluginSettingsManager.add('ticket-template', { icon: 'FileTextOutlined', title: tval('Helpdesk'), Component: TicketDashboard }); }
}
export default PluginTicketTemplateClient;

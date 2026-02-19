/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag, List, Button } from 'antd';
import {
  TeamOutlined, UserOutlined, DollarOutlined, PhoneOutlined,
  RiseOutlined, TrophyOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

/** CRM Dashboard — overview of key CRM metrics. */
const CrmDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({
    customers: 0, contacts: 0, deals: 0, activities: 0,
    openDeals: 0, wonDeals: 0, totalRevenue: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [custRes, contRes, dealRes, actRes] = await Promise.all([
          api.request({ url: 'crmCustomers:list', params: { pageSize: 1 } }),
          api.request({ url: 'crmContacts:list', params: { pageSize: 1 } }),
          api.request({ url: 'crmDeals:list', params: { pageSize: 1 } }),
          api.request({ url: 'crmActivities:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          customers: custRes.data?.meta?.count || custRes.data?.data?.length || 0,
          contacts: contRes.data?.meta?.count || contRes.data?.data?.length || 0,
          deals: dealRes.data?.meta?.count || dealRes.data?.data?.length || 0,
          activities: actRes.data?.meta?.count || actRes.data?.data?.length || 0,
          openDeals: 0, wonDeals: 0, totalRevenue: 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);

  const cards = [
    { title: 'Customers', value: stats.customers, icon: <TeamOutlined />, color: '#1677ff' },
    { title: 'Contacts', value: stats.contacts, icon: <UserOutlined />, color: '#52c41a' },
    { title: 'Deals', value: stats.deals, icon: <DollarOutlined />, color: '#faad14' },
    { title: 'Activities', value: stats.activities, icon: <CalendarOutlined />, color: '#722ed1' },
  ];

  const quickLinks = [
    { title: 'Add Customer', collection: 'crmCustomers', icon: <TeamOutlined /> },
    { title: 'Add Contact', collection: 'crmContacts', icon: <UserOutlined /> },
    { title: 'New Deal', collection: 'crmDeals', icon: <DollarOutlined /> },
    { title: 'Log Activity', collection: 'crmActivities', icon: <PhoneOutlined /> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>CRM Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {cards.map((card) => (
          <Col span={6} key={card.title}>
            <Card hoverable>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={React.cloneElement(card.icon as React.ReactElement, { style: { color: card.color } })}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="Quick Actions" size="small">
        <Space>
          {quickLinks.map((link) => (
            <Button key={link.title} icon={link.icon}>{link.title}</Button>
          ))}
        </Space>
      </Card>
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

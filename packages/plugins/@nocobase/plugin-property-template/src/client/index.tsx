import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { HomeOutlined, ToolOutlined, DollarOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const PropertyDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ owners: 0, repairs: 0, unpaidFees: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [ownRes, repRes, feeRes] = await Promise.all([
          api.request({ url: 'propOwners:list', params: { pageSize: 1 } }),
          api.request({ url: 'propRepairRequests:list', params: { filter: { status: { $ne: 'closed' } }, pageSize: 1 } }),
          api.request({ url: 'propFees:list', params: { filter: { status: 'unpaid' }, pageSize: 1 } }),
        ]);
        setStats({
          owners: ownRes.data?.meta?.count || ownRes.data?.data?.length || 0,
          repairs: repRes.data?.meta?.count || repRes.data?.data?.length || 0,
          unpaidFees: feeRes.data?.meta?.count || feeRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Property Management Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card hoverable><Statistic title="Owners/Tenants" value={stats.owners} prefix={<HomeOutlined style={{ color: '#1677ff' }} />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Open Repairs" value={stats.repairs} prefix={<ToolOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Unpaid Fees" value={stats.unpaidFees} prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space><Button icon={<HomeOutlined />}>Add Owner</Button><Button icon={<ToolOutlined />}>New Repair</Button><Button icon={<DollarOutlined />}>Record Fee</Button></Space>
      </Card>
    </div>
  );
};

export class PluginPropertyTemplateClient extends Plugin {
  async load() { this.app.pluginSettingsManager.add('property-template', { icon: 'HomeOutlined', title: tval('Property'), Component: PropertyDashboard }); }
}
export default PluginPropertyTemplateClient;

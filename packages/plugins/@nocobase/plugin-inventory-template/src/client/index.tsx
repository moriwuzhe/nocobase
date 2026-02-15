import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { ShoppingOutlined, SwapOutlined, WarningOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const InventoryDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ products: 0, movements: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [prodRes, movRes] = await Promise.all([
          api.request({ url: 'invProducts:list', params: { pageSize: 1 } }),
          api.request({ url: 'invStockMovements:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          products: prodRes.data?.meta?.count || prodRes.data?.data?.length || 0,
          movements: movRes.data?.meta?.count || movRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Inventory Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card hoverable><Statistic title="Products" value={stats.products} prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Stock Movements" value={stats.movements} prefix={<SwapOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Low Stock" value={0} prefix={<WarningOutlined style={{ color: '#faad14' }} />} /></Card></Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space><Button icon={<ShoppingOutlined />}>Add Product</Button><Button icon={<SwapOutlined />}>New Movement</Button></Space>
      </Card>
    </div>
  );
};

export class PluginInventoryTemplateClient extends Plugin {
  async load() { this.app.pluginSettingsManager.add('inventory-template', { icon: 'ShoppingOutlined', title: tval('Inventory'), Component: InventoryDashboard }); }
}
export default PluginInventoryTemplateClient;

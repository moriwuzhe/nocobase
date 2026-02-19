import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [count, setCount] = useState(0);
  useEffect(() => { (async () => { try { const r = await Promise.all([
        api.request({ url: 'ecOrders:list', params: { pageSize: 1 } }),]); setCount(r[0]?.data?.meta?.count || r[0]?.data?.data?.length || 0); } catch {} })(); }, [api]);
  return (<div style={{ padding: 24 }}><Title level={4}>E-commerce Dashboard</Title><Row gutter={16}><Col span={8}><Card hoverable><Statistic title="Total Records" value={count} prefix={<ShopOutlined style={{ color: '#1677ff' }} />} /></Card></Col></Row></div>);
};
export class Client extends Plugin { async load() { this.app.pluginSettingsManager.add('plugin-ecommerce-template', { icon: 'ShopOutlined', title: tval('E-commerce'), Component: Dashboard }); } }
export default Client;

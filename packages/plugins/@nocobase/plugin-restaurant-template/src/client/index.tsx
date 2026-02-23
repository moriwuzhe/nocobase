import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { CoffeeOutlined, ShoppingOutlined, TableOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient(); const [s, setS] = useState<any>(null); const [l, setL] = useState(true);
  const fetch = useCallback(async () => { setL(true); try { const [m, o, t] = await Promise.all([api.request({ url: 'restMenuItems:list', params: { pageSize: 1 } }), api.request({ url: 'restOrders:list', params: { filter: { status: { $ne: 'paid' } }, pageSize: 1 } }), api.request({ url: 'restTables:list', params: { filter: { status: 'occupied' }, pageSize: 1 } })]); setS({ menus: m?.data?.meta?.count || m?.data?.data?.length || 0, orders: o?.data?.meta?.count || o?.data?.data?.length || 0, tables: t?.data?.meta?.count || t?.data?.data?.length || 0 }); } catch {} setL(false); }, [api]);
  useEffect(() => { fetch(); }, [fetch]);
  if (l) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  return (<div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}><Title level={4}><CoffeeOutlined style={{ marginRight: 8 }} />餐饮管理仪表盘</Title><Row gutter={[16,16]}><Col xs={24} sm={8}><Card hoverable><Statistic title="菜品数" value={s?.menus||0} prefix={<CoffeeOutlined style={{ color: '#1677ff' }} />} /></Card></Col><Col xs={24} sm={8}><Card hoverable><Statistic title="进行中订单" value={s?.orders||0} prefix={<ShoppingOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col><Col xs={24} sm={8}><Card hoverable><Statistic title="用餐中桌位" value={s?.tables||0} prefix={<TableOutlined style={{ color: '#52c41a' }} />} /></Card></Col></Row></div>);
};
export class PluginRestaurantTemplateClient extends Plugin { async load() { this.app.pluginSettingsManager.add('restaurant-template', { icon: 'CoffeeOutlined', title: tval('Restaurant'), Component: Dashboard }); } }
export default PluginRestaurantTemplateClient;

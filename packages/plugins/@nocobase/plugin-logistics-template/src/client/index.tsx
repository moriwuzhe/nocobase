import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { CarOutlined, UserOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient(); const [s, setS] = useState<any>(null); const [l, setL] = useState(true);
  useEffect(() => { (async () => { setL(true); try { const [sh, dr] = await Promise.all([api.request({ url: 'logShipments:list', params: { pageSize: 1 } }), api.request({ url: 'logDrivers:list', params: { pageSize: 1 } })]); setS({ shipments: sh?.data?.meta?.count || sh?.data?.data?.length || 0, drivers: dr?.data?.meta?.count || dr?.data?.data?.length || 0 }); } catch {} setL(false); })(); }, [api]);
  if (l) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  return (<div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}><Title level={4}><CarOutlined style={{ marginRight: 8 }} />仓库物流仪表盘</Title><Row gutter={[16,16]}><Col xs={24} sm={12}><Card hoverable><Statistic title="运单总数" value={s?.shipments||0} prefix={<CarOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col><Col xs={24} sm={12}><Card hoverable><Statistic title="司机总数" value={s?.drivers||0} prefix={<UserOutlined style={{ color: '#52c41a' }} />} /></Card></Col></Row></div>);
};
export class PluginLogisticsTemplateClient extends Plugin { async load() { this.app.pluginSettingsManager.add('logistics-template', { icon: 'CarOutlined', title: tval('Logistics'), Component: Dashboard }); } }
export default PluginLogisticsTemplateClient;

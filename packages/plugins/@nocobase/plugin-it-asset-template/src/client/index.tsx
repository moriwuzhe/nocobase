import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { LaptopOutlined, KeyOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient(); const [s, setS] = useState<any>(null); const [l, setL] = useState(true);
  useEffect(() => { (async () => { setL(true); try { const [d, li] = await Promise.all([api.request({ url: 'itDevices:list', params: { pageSize: 1 } }), api.request({ url: 'itLicenses:list', params: { pageSize: 1 } })]); setS({ devices: d?.data?.meta?.count || d?.data?.data?.length || 0, licenses: li?.data?.meta?.count || li?.data?.data?.length || 0 }); } catch {} setL(false); })(); }, [api]);
  if (l) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  return (<div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}><Title level={4}><LaptopOutlined style={{ marginRight: 8 }} />IT资产管理仪表盘</Title><Row gutter={[16,16]}><Col xs={24} sm={12}><Card hoverable><Statistic title="设备总数" value={s?.devices||0} prefix={<LaptopOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col><Col xs={24} sm={12}><Card hoverable><Statistic title="软件许可" value={s?.licenses||0} prefix={<KeyOutlined style={{ color: '#722ed1' }} />} /></Card></Col></Row></div>);
};
export class PluginItAssetTemplateClient extends Plugin { async load() { this.app.pluginSettingsManager.add('it-asset-template', { icon: 'LaptopOutlined', title: tval('IT Asset'), Component: Dashboard }); } }
export default PluginItAssetTemplateClient;

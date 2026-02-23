import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { AuditOutlined, FileTextOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient(); const [s, setS] = useState<any>(null); const [l, setL] = useState(true);
  const fetch = useCallback(async () => { setL(true); try { const [c, d] = await Promise.all([api.request({ url: 'legalCases:list', params: { pageSize: 1 } }), api.request({ url: 'legalDocuments:list', params: { pageSize: 1 } })]); setS({ cases: c?.data?.meta?.count || c?.data?.data?.length || 0, docs: d?.data?.meta?.count || d?.data?.data?.length || 0 }); } catch {} setL(false); }, [api]);
  useEffect(() => { fetch(); }, [fetch]);
  if (l) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  return (<div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}><Title level={4}><AuditOutlined style={{ marginRight: 8 }} />法务管理仪表盘</Title><Row gutter={[16,16]}><Col xs={24} sm={12}><Card hoverable><Statistic title="案件总数" value={s?.cases||0} prefix={<AuditOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col><Col xs={24} sm={12}><Card hoverable><Statistic title="法律文书" value={s?.docs||0} prefix={<FileTextOutlined style={{ color: '#722ed1' }} />} /></Card></Col></Row></div>);
};
export class PluginLegalTemplateClient extends Plugin { async load() { this.app.pluginSettingsManager.add('legal-template', { icon: 'AuditOutlined', title: tval('Legal'), Component: Dashboard }); } }
export default PluginLegalTemplateClient;

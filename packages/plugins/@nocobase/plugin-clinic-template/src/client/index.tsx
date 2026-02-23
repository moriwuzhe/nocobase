import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty } from 'antd';
import { MedicineBoxOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
const { Title } = Typography;
const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes, rRes] = await Promise.all([
        api.request({ url: 'clinicPatients:list', params: { pageSize: 1 } }),
        api.request({ url: 'clinicAppointments:list', params: { filter: { status: 'scheduled' }, pageSize: 1 } }),
        api.request({ url: 'clinicMedicalRecords:list', params: { pageSize: 1 } }),
      ]);
      setStats({
        patients: pRes?.data?.meta?.count || pRes?.data?.data?.length || 0,
        appointments: aRes?.data?.meta?.count || aRes?.data?.data?.length || 0,
        records: rRes?.data?.meta?.count || rRes?.data?.data?.length || 0,
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);
  useEffect(() => { fetchData(); }, [fetchData]);
  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><MedicineBoxOutlined style={{ marginRight: 8 }} />诊所管理仪表盘</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><Card hoverable><Statistic title="患者总数" value={stats?.patients || 0} prefix={<UserOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={8}><Card hoverable><Statistic title="待诊预约" value={stats?.appointments || 0} prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={8}><Card hoverable><Statistic title="病历总数" value={stats?.records || 0} prefix={<FileTextOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
    </div>
  );
};
export class PluginClinicTemplateClient extends Plugin {
  async load() { this.app.pluginSettingsManager.add('clinic-template', { icon: 'MedicineBoxOutlined', title: tval('Clinic'), Component: Dashboard }); }
}
export default PluginClinicTemplateClient;

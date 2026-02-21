/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty, Alert,
} from 'antd';
import {
  CarOutlined, SafetyCertificateOutlined, ToolOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'vehicles:list',
        params: { pageSize: 200, sort: ['-createdAt'] },
      });
      setVehicles(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = vehicles.length;
  const active = vehicles.filter((v) => v.status === 'active').length;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const insuranceExpiring = vehicles.filter((v) => {
    if (!v.insuranceExpiry) return false;
    const d = new Date(v.insuranceExpiry).getTime() - now;
    return d > 0 && d < thirtyDays;
  }).length;
  const inspectionExpiring = vehicles.filter((v) => {
    if (!v.nextInspectionDate) return false;
    const d = new Date(v.nextInspectionDate).getTime() - now;
    return d > 0 && d < thirtyDays;
  }).length;

  const columns = [
    { title: '车牌号', dataIndex: 'plateNumber', key: 'plateNumber', width: 110 },
    { title: '品牌型号', key: 'model', render: (_: any, r: any) => `${r.brand || ''} ${r.model || ''}`.trim() || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
      const map: Record<string, { l: string; c: string }> = { active: { l: '使用中', c: 'green' }, idle: { l: '闲置', c: 'default' }, maintenance: { l: '维修中', c: 'orange' }, scrapped: { l: '已报废', c: 'red' } };
      const s = map[v]; return s ? <Tag color={s.c}>{s.l}</Tag> : <Tag>{v}</Tag>;
    }},
    { title: '保险到期', dataIndex: 'insuranceExpiry', key: 'ins', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '使用部门', dataIndex: 'department', key: 'dept' },
  ];

  const warnings = insuranceExpiring + inspectionExpiring;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><CarOutlined style={{ marginRight: 8 }} />车辆管理仪表盘</Title>
      {warnings > 0 && <Alert message={`${insuranceExpiring} 辆车保险即将到期，${inspectionExpiring} 辆车年检即将到期`} type="warning" showIcon style={{ marginBottom: 16 }} />}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="车辆总数" value={total} prefix={<CarOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="使用中" value={active} prefix={<CarOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="保险到期预警" value={insuranceExpiring} prefix={<SafetyCertificateOutlined style={{ color: insuranceExpiring > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: insuranceExpiring > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="年检到期预警" value={inspectionExpiring} prefix={<ToolOutlined style={{ color: inspectionExpiring > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: inspectionExpiring > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
      </Row>
      <Card title="车辆列表" size="small">
        <Table dataSource={vehicles.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export class PluginVehicleTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('vehicle-template', { icon: 'CarOutlined', title: tval('Vehicle Fleet'), Component: Dashboard });
  }
}
export default PluginVehicleTemplateClient;

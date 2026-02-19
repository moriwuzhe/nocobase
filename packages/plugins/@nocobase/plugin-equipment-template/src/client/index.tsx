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
  ToolOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'eqEquipment:list',
        params: { pageSize: 200, sort: ['-createdAt'] },
      });
      setEquipment(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = equipment.length;
  const running = equipment.filter((e) => e.status === 'running').length;
  const maintenance = equipment.filter((e) => e.status === 'maintenance').length;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const maintenanceDue = equipment.filter((e) => {
    if (!e.nextMaintenanceDate) return false;
    const d = new Date(e.nextMaintenanceDate).getTime() - now;
    return d > 0 && d < thirtyDays;
  }).length;

  const columns = [
    { title: '资产编号', dataIndex: 'assetCode', key: 'assetCode', width: 120 },
    { title: '设备名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '型号', dataIndex: 'model', key: 'model' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
      const map: Record<string, { l: string; c: string }> = { running: { l: '运行中', c: 'green' }, idle: { l: '闲置', c: 'default' }, maintenance: { l: '维护中', c: 'orange' }, decommissioned: { l: '已报废', c: 'red' } };
      const s = map[v]; return s ? <Tag color={s.c}>{s.l}</Tag> : <Tag>{v}</Tag>;
    }},
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '上次保养', dataIndex: 'lastMaintenanceDate', key: 'lastMaint', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><ToolOutlined style={{ marginRight: 8 }} />设备维保仪表盘</Title>
      {maintenanceDue > 0 && <Alert message={`${maintenanceDue} 台设备即将到达保养期限`} type="warning" showIcon style={{ marginBottom: 16 }} />}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="设备总数" value={total} prefix={<ToolOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="运行中" value={running} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="维护中" value={maintenance} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="保养预警" value={maintenanceDue} prefix={<WarningOutlined style={{ color: maintenanceDue > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: maintenanceDue > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
      </Row>
      <Card title="设备列表" size="small">
        <Table dataSource={equipment.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export class PluginEquipmentTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('equipment-template', { icon: 'ToolOutlined', title: tval('Equipment'), Component: Dashboard });
  }
}
export default PluginEquipmentTemplateClient;

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
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty,
} from 'antd';
import {
  CrownOutlined, UserOutlined, GiftOutlined, WalletOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const LEVEL_MAP: Record<string, { label: string; color: string }> = {
  normal: { label: '普通会员', color: 'default' },
  silver: { label: '银卡会员', color: 'cyan' },
  gold: { label: '金卡会员', color: 'gold' },
  platinum: { label: '白金会员', color: 'purple' },
  diamond: { label: '钻石会员', color: 'magenta' },
};

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({
        url: 'members:list',
        params: { pageSize: 200, sort: ['-createdAt'] },
      });
      setMembers(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const total = members.length;
  const active = members.filter((m) => m.status === 'active').length;
  const totalPoints = members.reduce((s, m) => s + (m.points || 0), 0);
  const totalBalance = members.reduce((s, m) => s + (m.balance || 0), 0);

  const byLevel: Record<string, number> = {};
  members.forEach((m) => { byLevel[m.level || 'normal'] = (byLevel[m.level || 'normal'] || 0) + 1; });

  const columns = [
    { title: '会员号', dataIndex: 'memberNo', key: 'memberNo', width: 130 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '等级', dataIndex: 'level', key: 'level', render: (v: string) => { const l = LEVEL_MAP[v]; return l ? <Tag color={l.color}>{l.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '积分', dataIndex: 'points', key: 'points', render: (v: number) => v?.toLocaleString() || '0' },
    { title: '余额', dataIndex: 'balance', key: 'balance', render: (v: number) => v ? `¥${v.toFixed(2)}` : '¥0' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><CrownOutlined style={{ marginRight: 8 }} />会员管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="会员总数" value={total} prefix={<UserOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="活跃会员" value={active} prefix={<CrownOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="总积分" value={totalPoints} prefix={<GiftOutlined style={{ color: '#fa8c16' }} />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="总储值" value={totalBalance} prefix={<WalletOutlined style={{ color: '#722ed1' }} />} precision={2} formatter={(v) => `¥${(v as number).toLocaleString()}`} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="等级分布" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(LEVEL_MAP).map(([key, l]) => {
                const count = byLevel[key] || 0;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tag color={l.color}>{l.label}</Tag>
                    <Text strong>{count} 人</Text>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新会员" size="small" style={{ height: '100%' }}>
            <Table dataSource={members.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginMembershipTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('membership-template', { icon: 'CrownOutlined', title: tval('Membership'), Component: Dashboard });
  }
}
export default PluginMembershipTemplateClient;

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { CarOutlined, UserOutlined } from '@ant-design/icons';
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
      const res = await api.request({ url: 'logisticsDashboard:stats' });
      if (res?.data?.data) setStats(res.data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4}>
        <CarOutlined style={{ marginRight: 8 }} />
        仓库物流仪表盘
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="运单总数"
              value={stats?.totalShipments || 0}
              prefix={<CarOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="在途运单"
              value={stats?.inTransitShipments || 0}
              prefix={<CarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="可用司机"
              value={stats?.availableDrivers || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="签收率" value={stats?.deliveryRate || 0} suffix="%" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginLogisticsTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('logistics-template', {
      icon: 'CarOutlined',
      title: tval('Logistics'),
      Component: Dashboard,
    });
  }
}

export default PluginLogisticsTemplateClient;

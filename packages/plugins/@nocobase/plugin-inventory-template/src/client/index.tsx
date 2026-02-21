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
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Table,
  Progress,
  Spin,
  Empty,
  Alert,
} from 'antd';
import {
  ShoppingOutlined,
  SwapOutlined,
  WarningOutlined,
  DatabaseOutlined,
  DollarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const formatCurrency = (val: number): string => {
  if (val >= 10000) return `¥${(val / 10000).toFixed(1)}万`;
  return `¥${val.toLocaleString()}`;
};

const InventoryDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.request({ url: 'invDashboard:stats' });
      if (res?.data?.data) setStats(res.data.data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!stats) {
    return <div style={{ padding: 48 }}><Empty description="暂无数据" /></div>;
  }

  const lowStockColumns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    { title: '商品名称', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '当前库存',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => <Text type={v <= 0 ? 'danger' : 'warning'} strong>{v}</Text>,
    },
    { title: '安全库存', dataIndex: 'minStock', key: 'minStock' },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) =>
        record.quantity <= 0 ? (
          <Tag color="red">缺货</Tag>
        ) : (
          <Tag color="orange">库存不足</Tag>
        ),
    },
  ];

  const categoryEntries = Object.entries(stats.byCategory || {}).sort(
    (a, b) => (b[1] as any).quantity - (a[1] as any).quantity,
  );

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <DatabaseOutlined style={{ marginRight: 8 }} />
        进销存仪表盘
      </Title>

      {stats.lowStockCount > 0 && (
        <Alert
          message={`${stats.lowStockCount} 个商品库存不足，${stats.outOfStockCount} 个商品已缺货`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="商品总数" value={stats.totalProducts} prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="总库存量" value={stats.totalStock} prefix={<InboxOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="库存总值" value={stats.totalValue} prefix={<DollarOutlined style={{ color: '#fa8c16' }} />} formatter={(val) => formatCurrency(val as number)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="库存预警" value={stats.lowStockCount} prefix={<WarningOutlined style={{ color: stats.lowStockCount > 0 ? '#ff4d4f' : '#52c41a' }} />} valueStyle={{ color: stats.lowStockCount > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="仓库数" value={stats.totalWarehouses} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="近期入库" value={stats.recentInCount} valueStyle={{ color: '#52c41a' }} suffix="笔" /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="近期出库" value={stats.recentOutCount} valueStyle={{ color: '#fa8c16' }} suffix="笔" /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="缺货商品" value={stats.outOfStockCount} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="分类库存" size="small" style={{ height: '100%' }}>
            {categoryEntries.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分类数据" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {categoryEntries.map(([cat, data]) => {
                  const d = data as any;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text>{cat}</Text>
                        <Space>
                          <Text type="secondary">{d.count} 种</Text>
                          <Text strong>{d.quantity} 件</Text>
                        </Space>
                      </div>
                      <Progress
                        percent={Math.round((d.quantity / (stats.totalStock || 1)) * 100)}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="库存预警商品" size="small" style={{ height: '100%' }}>
            {(stats.lowStockItems || []).length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="所有商品库存充足" />
            ) : (
              <Table
                dataSource={stats.lowStockItems}
                columns={lowStockColumns}
                rowKey="sku"
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginInventoryTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('inventory-template', {
      icon: 'ShoppingOutlined',
      title: tval('Inventory'),
      Component: InventoryDashboard,
    });
  }
}

export default PluginInventoryTemplateClient;

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
  Card, Row, Col, Tag, Button, Input, Typography, Space, Badge,
  message, Spin, Segmented, Modal, List, Tooltip, Empty,
} from 'antd';
import {
  AppstoreOutlined, CheckCircleFilled, DownloadOutlined,
  StopOutlined, SearchOutlined, InfoCircleOutlined,
  TeamOutlined, ShopOutlined, CrownOutlined, ShoppingCartOutlined,
  DatabaseOutlined, FileProtectOutlined, AccountBookOutlined,
  IdcardOutlined, SolutionOutlined, DesktopOutlined,
  ProjectOutlined, FileTextOutlined, CustomerServiceOutlined,
  CarOutlined, ToolOutlined, HomeOutlined, ReadOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text, Paragraph } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  TeamOutlined: <TeamOutlined />, ShopOutlined: <ShopOutlined />,
  CrownOutlined: <CrownOutlined />, ShoppingCartOutlined: <ShoppingCartOutlined />,
  DatabaseOutlined: <DatabaseOutlined />, FileProtectOutlined: <FileProtectOutlined />,
  AccountBookOutlined: <AccountBookOutlined />, IdcardOutlined: <IdcardOutlined />,
  SolutionOutlined: <SolutionOutlined />, DesktopOutlined: <DesktopOutlined />,
  ProjectOutlined: <ProjectOutlined />, FileTextOutlined: <FileTextOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />, CarOutlined: <CarOutlined />,
  ToolOutlined: <ToolOutlined />, HomeOutlined: <HomeOutlined />,
  ReadOutlined: <ReadOutlined />,
};

const categoryLabels: Record<string, { label: string; labelZh: string; color: string }> = {
  sales: { label: 'Sales', labelZh: '销售', color: '#1677ff' },
  supply: { label: 'Supply Chain', labelZh: '供应链', color: '#52c41a' },
  finance: { label: 'Finance', labelZh: '财务', color: '#faad14' },
  hr: { label: 'HR', labelZh: '人事', color: '#722ed1' },
  office: { label: 'Office', labelZh: '办公', color: '#13c2c2' },
  service: { label: 'Service', labelZh: '服务', color: '#eb2f96' },
  assets: { label: 'Assets', labelZh: '资产', color: '#fa541c' },
  community: { label: 'Community', labelZh: '社区', color: '#2f54eb' },
};

interface TemplateItem {
  name: string;
  pluginName: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  category: string;
  collections: string[];
  tags: string[];
  enabled: boolean;
  installed: boolean;
}

const TemplateMarketPage: React.FC = () => {
  const api = useAPIClient();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await api.request({ url: 'templateMarket:list', params });
      setTemplates(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api, category, search]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleActivate = async (name: string) => {
    setActivating(name);
    try {
      const res = await api.request({
        url: 'templateMarket:activate',
        method: 'POST',
        data: { name },
      });
      if (res.data?.data?.success) {
        message.success(res.data.data.message);
        fetchTemplates();
      } else {
        message.error(res.data?.data?.error || 'Activation failed');
      }
    } catch (err: any) {
      message.error(err.message);
    }
    setActivating(null);
  };

  const handleDeactivate = async (name: string) => {
    Modal.confirm({
      title: 'Deactivate Template',
      content: 'This will disable the template plugin. Your data will NOT be deleted.',
      onOk: async () => {
        try {
          await api.request({
            url: 'templateMarket:deactivate',
            method: 'POST',
            data: { name },
          });
          message.success('Deactivated');
          fetchTemplates();
        } catch (err: any) {
          message.error(err.message);
        }
      },
    });
  };

  const openDetail = (t: TemplateItem) => {
    setSelectedTemplate(t);
    setDetailVisible(true);
  };

  const enabledCount = templates.filter((t) => t.enabled).length;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Template Market
        </Title>
        <Text type="secondary">
          Browse and activate pre-built business templates. Each template creates ready-to-use collections with full field schemas.
        </Text>
        <Space>
          <Tag color="green">{enabledCount} activated</Tag>
          <Tag>{templates.length} available</Tag>
        </Space>
      </Space>

      {/* Search + Category Filter */}
      <Space style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Segmented
          value={category}
          onChange={(v) => setCategory(v as string)}
          options={[
            { label: 'All', value: 'all' },
            ...Object.entries(categoryLabels).map(([key, val]) => ({
              label: val.labelZh,
              value: key,
            })),
          ]}
        />
      </Space>

      {/* Template Grid */}
      <Spin spinning={loading}>
        {templates.length === 0 && !loading ? (
          <Empty description="No templates found" />
        ) : (
          <Row gutter={[16, 16]}>
            {templates.map((t) => {
              const cat = categoryLabels[t.category];
              return (
                <Col key={t.name} xs={24} sm={12} md={8} lg={6}>
                  <Badge.Ribbon
                    text={t.enabled ? '已启用' : ''}
                    color={t.enabled ? 'green' : 'transparent'}
                    style={t.enabled ? {} : { display: 'none' }}
                  >
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderColor: t.enabled ? '#52c41a' : undefined,
                      }}
                      actions={[
                        <Tooltip title="Details">
                          <InfoCircleOutlined onClick={() => openDetail(t)} />
                        </Tooltip>,
                        t.enabled ? (
                          <Tooltip title="Deactivate">
                            <StopOutlined
                              style={{ color: '#ff4d4f' }}
                              onClick={() => handleDeactivate(t.name)}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate">
                            <DownloadOutlined
                              style={{ color: '#52c41a' }}
                              onClick={() => handleActivate(t.name)}
                            />
                          </Tooltip>
                        ),
                      ]}
                    >
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <div style={{
                          fontSize: 32,
                          width: 64,
                          height: 64,
                          lineHeight: '64px',
                          borderRadius: 16,
                          background: `${cat?.color || '#1677ff'}15`,
                          color: cat?.color || '#1677ff',
                          margin: '0 auto 8px',
                        }}>
                          {iconMap[t.icon] || <AppstoreOutlined />}
                        </div>
                        <Title level={5} style={{ margin: 0 }}>{t.titleZh}</Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t.title}</Text>
                      </div>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ fontSize: 12, color: '#666', marginBottom: 8, minHeight: 36 }}
                      >
                        {t.descriptionZh}
                      </Paragraph>
                      <Space wrap size={4}>
                        <Tag color={cat?.color} style={{ fontSize: 10 }}>{cat?.labelZh}</Tag>
                        <Tag style={{ fontSize: 10 }}>{t.collections.length} 个集合</Tag>
                      </Space>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            {selectedTemplate && iconMap[selectedTemplate.icon]}
            {selectedTemplate?.titleZh}
            <Text type="secondary">({selectedTemplate?.title})</Text>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          selectedTemplate && (
            <Space>
              <Button onClick={() => setDetailVisible(false)}>Close</Button>
              {selectedTemplate.enabled ? (
                <Button danger onClick={() => { handleDeactivate(selectedTemplate.name); setDetailVisible(false); }}>
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={activating === selectedTemplate.name}
                  onClick={() => { handleActivate(selectedTemplate.name); setDetailVisible(false); }}
                >
                  Activate Template
                </Button>
              )}
            </Space>
          )
        }
        width={560}
      >
        {selectedTemplate && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Paragraph>{selectedTemplate.descriptionZh}</Paragraph>
            <Paragraph type="secondary">{selectedTemplate.description}</Paragraph>

            <div>
              <Text strong>Status: </Text>
              {selectedTemplate.enabled ? (
                <Tag icon={<CheckCircleFilled />} color="success">Activated</Tag>
              ) : (
                <Tag>Not activated</Tag>
              )}
            </div>

            <div>
              <Text strong>Category: </Text>
              <Tag color={categoryLabels[selectedTemplate.category]?.color}>
                {categoryLabels[selectedTemplate.category]?.labelZh}
              </Tag>
            </div>

            <div>
              <Text strong>Collections ({selectedTemplate.collections.length}):</Text>
              <List
                size="small"
                dataSource={selectedTemplate.collections}
                renderItem={(col: string) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Tag>{col}</Tag>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <Text strong>Plugin: </Text>
              <Text code>{selectedTemplate.pluginName}</Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export class PluginTemplateMarketClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('template-market', {
      icon: 'AppstoreOutlined',
      title: tval('Template Market'),
      Component: TemplateMarketPage,
    });
  }
}

export default PluginTemplateMarketClient;

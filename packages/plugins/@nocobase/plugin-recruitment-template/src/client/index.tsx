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
  Card, Row, Col, Statistic, Typography, Space, Tag, Table, Spin, Empty, Progress,
} from 'antd';
import {
  SolutionOutlined, UserAddOutlined, FileSearchOutlined, CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const STAGE_MAP: Record<string, { label: string; color: string }> = {
  new: { label: '新候选人', color: 'default' },
  screening: { label: '筛选中', color: 'processing' },
  interview: { label: '面试中', color: 'blue' },
  offer: { label: '已发Offer', color: 'orange' },
  hired: { label: '已录用', color: 'success' },
  rejected: { label: '已淘汰', color: 'error' },
  withdrawn: { label: '已撤回', color: 'default' },
};

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [candRes, jobRes] = await Promise.all([
        api.request({ url: 'recCandidates:list', params: { pageSize: 200, sort: ['-createdAt'], appends: ['jobPosting'] } }),
        api.request({ url: 'recJobPostings:list', params: { pageSize: 100 } }),
      ]);
      setCandidates(candRes?.data?.data || []);
      setJobs(jobRes?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const totalCandidates = candidates.length;
  const inPipeline = candidates.filter((c) => ['screening', 'interview', 'offer'].includes(c.stage)).length;
  const hired = candidates.filter((c) => c.stage === 'hired').length;
  const openJobs = jobs.filter((j) => j.status === 'published').length;

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '应聘职位', dataIndex: ['jobPosting', 'title'], key: 'job', ellipsis: true },
    { title: '阶段', dataIndex: 'stage', key: 'stage', render: (v: string) => { const s = STAGE_MAP[v]; return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v}</Tag>; } },
    { title: '申请日期', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><SolutionOutlined style={{ marginRight: 8 }} />招聘管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="候选人总数" value={totalCandidates} prefix={<TeamOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="流程中" value={inPipeline} prefix={<FileSearchOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="已录用" value={hired} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="开放职位" value={openJobs} prefix={<UserAddOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="候选人阶段分布" size="small" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {Object.entries(STAGE_MAP).map(([key, s]) => {
                const count = candidates.filter((c) => c.stage === key).length;
                if (count === 0) return null;
                const pct = totalCandidates ? Math.round((count / totalCandidates) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Tag color={s.color}>{s.label}</Tag>
                      <Text>{count} ({pct}%)</Text>
                    </div>
                    <Progress percent={pct} showInfo={false} strokeColor={s.color === 'default' ? '#d9d9d9' : s.color} size="small" />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最新候选人" size="small" style={{ height: '100%' }}>
            <Table dataSource={candidates.slice(0, 10)} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginRecruitmentTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('recruitment-template', { icon: 'SolutionOutlined', title: tval('Recruitment'), Component: Dashboard });
  }
}
export default PluginRecruitmentTemplateClient;

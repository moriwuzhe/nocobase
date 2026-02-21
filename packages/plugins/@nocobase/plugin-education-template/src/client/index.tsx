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
  ReadOutlined, UserOutlined, BookOutlined, TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const api = useAPIClient();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stuRes, courseRes] = await Promise.all([
        api.request({ url: 'eduStudents:list', params: { pageSize: 200, sort: ['-createdAt'] } }),
        api.request({ url: 'eduCourses:list', params: { pageSize: 100 } }),
      ]);
      setStudents(stuRes?.data?.data || []);
      setCourses(courseRes?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status === 'active').length;

  const avgScore = (() => {
    const scores = students.map((s) => s.avgScore).filter((s) => s != null);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum: number, v: number) => sum + v, 0) / scores.length * 10) / 10;
  })();

  const byGrade: Record<string, number> = {};
  students.forEach((s) => { const g = s.grade || '未分配'; byGrade[g] = (byGrade[g] || 0) + 1; });

  const stuColumns = [
    { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 110 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const map: Record<string, { l: string; c: string }> = {
          active: { l: '在读', c: 'green' }, graduated: { l: '已毕业', c: 'blue' },
          suspended: { l: '休学', c: 'orange' }, withdrawn: { l: '退学', c: 'red' },
        };
        const s = map[v]; return s ? <Tag color={s.c}>{s.l}</Tag> : <Tag>{v}</Tag>;
      },
    },
    { title: '均分', dataIndex: 'avgScore', key: 'avgScore', render: (v: number) => v != null ? v.toFixed(1) : '-' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}><ReadOutlined style={{ marginRight: 8 }} />教务管理仪表盘</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="学生总数" value={totalStudents} prefix={<UserOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="在读学生" value={activeStudents} prefix={<TeamOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="开设课程" value={activeCourses} prefix={<BookOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} suffix={<Text type="secondary" style={{ fontSize: 14 }}>/ {totalCourses}</Text>} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card hoverable><Statistic title="全校均分" value={avgScore} prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="年级人数分布" size="small" style={{ height: '100%' }}>
            {Object.keys(byGrade).length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {Object.entries(byGrade).sort().map(([grade, count]) => (
                  <div key={grade} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tag color="blue">{grade}</Tag>
                    <Text strong>{count} 人</Text>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="学生列表" size="small" style={{ height: '100%' }}>
            <Table dataSource={students.slice(0, 10)} columns={stuColumns} rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class PluginEducationTemplateClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('education-template', { icon: 'ReadOutlined', title: tval('Education'), Component: Dashboard });
  }
}
export default PluginEducationTemplateClient;

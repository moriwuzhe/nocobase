import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { UserOutlined, ReadOutlined, TrophyOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Title } = Typography;

const EducationDashboard: React.FC = () => {
  const api = useAPIClient();
  const [stats, setStats] = useState({ students: 0, courses: 0, grades: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [stuRes, couRes, graRes] = await Promise.all([
          api.request({ url: 'eduStudents:list', params: { pageSize: 1 } }),
          api.request({ url: 'eduCourses:list', params: { pageSize: 1 } }),
          api.request({ url: 'eduGrades:list', params: { pageSize: 1 } }),
        ]);
        setStats({
          students: stuRes.data?.meta?.count || stuRes.data?.data?.length || 0,
          courses: couRes.data?.meta?.count || couRes.data?.data?.length || 0,
          grades: graRes.data?.meta?.count || graRes.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    })();
  }, [api]);
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Education Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card hoverable><Statistic title="Students" value={stats.students} prefix={<UserOutlined style={{ color: '#1677ff' }} />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Courses" value={stats.courses} prefix={<ReadOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="Grade Records" value={stats.grades} prefix={<TrophyOutlined style={{ color: '#faad14' }} />} /></Card></Col>
      </Row>
      <Card title="Quick Actions" size="small">
        <Space><Button icon={<UserOutlined />}>Add Student</Button><Button icon={<ReadOutlined />}>Add Course</Button><Button icon={<TrophyOutlined />}>Record Grade</Button></Space>
      </Card>
    </div>
  );
};

export class PluginEducationTemplateClient extends Plugin {
  async load() { this.app.pluginSettingsManager.add('education-template', { icon: 'ReadOutlined', title: tval('Education'), Component: EducationDashboard }); }
}
export default PluginEducationTemplateClient;

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';
import { useT } from '../locale';

const { Title } = Typography;

/**
 * ApprovalBlock — a dashboard-style block showing approval stats summary.
 * Can be added to any page via the schema initializer.
 */
export const ApprovalBlock: React.FC = () => {
  const t = useT();
  const api = useAPIClient();
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, initiated: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.request({ url: 'approvalTasks:stats' });
        setStats(res.data?.data || {});
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [api]);

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>{t('My Approvals')}</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title={t('Pending Approval')}
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              loading={loading}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title={t('Approved')}
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title={t('Rejected')}
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              loading={loading}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title={t('Initiated by Me')}
              value={stats.initiated}
              prefix={<SendOutlined style={{ color: '#1677ff' }} />}
              loading={loading}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

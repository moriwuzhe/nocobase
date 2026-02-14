/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, Tag, Space, Button, Badge, Empty, message, Modal, Input, Select } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RollbackOutlined,
  BellOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { APPROVAL_STATUS, ApprovalStatusOptions } from '../../common/constants';
import { useT } from '../locale';

const { TextArea } = Input;

const statusTagMap: Record<number, { color: string; icon: React.ReactNode }> = {
  [APPROVAL_STATUS.PENDING]: { color: 'gold', icon: <ClockCircleOutlined /> },
  [APPROVAL_STATUS.APPROVED]: { color: 'green', icon: <CheckCircleOutlined /> },
  [APPROVAL_STATUS.REJECTED]: { color: 'red', icon: <CloseCircleOutlined /> },
  [APPROVAL_STATUS.RETURNED]: { color: 'orange', icon: <RollbackOutlined /> },
  [APPROVAL_STATUS.WITHDRAWN]: { color: 'default', icon: null },
  [APPROVAL_STATUS.AUTO_APPROVED]: { color: 'lime', icon: <CheckCircleOutlined /> },
};

/**
 * Approval Center page component.
 * Three tabs: Pending / Processed / Initiated by Me
 */
export const ApprovalCenter: React.FC = () => {
  const t = useT();
  const api = useAPIClient();
  const currentUser = useCurrentUserContext();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, initiated: 0 });

  const fetchTasks = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const filter: Record<string, any> = {};
      if (tab === 'pending') {
        filter.status = APPROVAL_STATUS.PENDING;
      } else if (tab === 'processed') {
        filter.status = { $ne: APPROVAL_STATUS.PENDING };
      }

      const res = await api.request({
        url: 'approvalTasks:listMine',
        params: { filter },
      });
      setTasks(res.data?.data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.request({ url: 'approvalTasks:stats' });
      setStats(res.data?.data || {});
    } catch {
      // ignore
    }
  }, [api]);

  useEffect(() => {
    fetchTasks(activeTab);
    fetchStats();
  }, [activeTab, fetchTasks, fetchStats]);

  const handleApprove = async (taskId: string, action: string) => {
    const comment = await showCommentModal(action);
    if (comment === null) return; // cancelled

    try {
      await api.request({
        url: `approvalTasks:submit/${taskId}`,
        method: 'POST',
        data: { action, comment },
      });
      message.success(t('Processing...'));
      fetchTasks(activeTab);
      fetchStats();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleUrge = async (taskId: string) => {
    try {
      await api.request({
        url: `approvalTasks:urge/${taskId}`,
        method: 'POST',
      });
      message.success(t('Reminder sent'));
    } catch (err) {
      message.error(err.message);
    }
  };

  const showCommentModal = (action: string): Promise<string | null> => {
    return new Promise((resolve) => {
      let commentValue = '';
      Modal.confirm({
        title: t(action.charAt(0).toUpperCase() + action.slice(1)),
        content: (
          <TextArea
            rows={3}
            placeholder={t('Approval Comment')}
            onChange={(e) => (commentValue = e.target.value)}
          />
        ),
        onOk: () => resolve(commentValue),
        onCancel: () => resolve(null),
      });
    });
  };

  const columns = [
    {
      title: t('Task title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('Approval Mode'),
      dataIndex: 'approvalMode',
      key: 'approvalMode',
      render: (mode: string) => {
        const modeLabels: Record<string, string> = {
          sequential: t('Sequential'),
          countersign: t('Countersign'),
          or_sign: t('Or Sign'),
          vote_percentage: t('Vote Percentage'),
        };
        return modeLabels[mode] || mode;
      },
    },
    {
      title: '{{t("Status")}}',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const opt = ApprovalStatusOptions.find((o) => o.value === status);
        const tagInfo = statusTagMap[status] || { color: 'default', icon: null };
        return (
          <Tag color={tagInfo.color} icon={tagInfo.icon}>
            {opt?.label || status}
          </Tag>
        );
      },
    },
    {
      title: '{{t("Created at")}}',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: '{{t("Actions")}}',
      key: 'actions',
      render: (_: any, record: any) => {
        if (record.status !== APPROVAL_STATUS.PENDING) return null;
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.id, 'approve')}
            >
              {t('Approve')}
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleApprove(record.id, 'reject')}
            >
              {t('Reject')}
            </Button>
            <Button
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => handleApprove(record.id, 'return')}
            >
              {t('Return')}
            </Button>
            <Button
              size="small"
              icon={<BellOutlined />}
              onClick={() => handleUrge(record.id)}
            >
              {t('Urge')}
            </Button>
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <Badge count={stats.pending} offset={[10, 0]}>
          {t('Pending Approval')}
        </Badge>
      ),
    },
    {
      key: 'processed',
      label: t('My Approvals'),
    },
    {
      key: 'initiated',
      label: t('Initiated by Me'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <Table
        loading={loading}
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        locale={{
          emptyText: <Empty description={t('No pending approvals')} />,
        }}
      />
    </div>
  );
};

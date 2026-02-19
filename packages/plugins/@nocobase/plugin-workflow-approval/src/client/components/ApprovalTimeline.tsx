/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Timeline, Tag, Typography, Space, Avatar } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RollbackOutlined,
  SwapOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { APPROVAL_STATUS } from '../../common/constants';
import { useT } from '../locale';

const { Text, Paragraph } = Typography;

interface ApprovalTask {
  id: string;
  userId: number;
  user?: { nickname: string; avatar?: string };
  status: number;
  comment?: string;
  processedAt?: string;
  createdAt?: string;
}

interface ApprovalTimelineProps {
  tasks: ApprovalTask[];
  initiator?: { nickname: string; avatar?: string };
  submittedAt?: string;
}

const statusConfig: Record<number, { color: string; icon: React.ReactNode; label: string }> = {
  [APPROVAL_STATUS.PENDING]: { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending Approval' },
  [APPROVAL_STATUS.APPROVED]: { color: 'green', icon: <CheckCircleOutlined />, label: 'Approved' },
  [APPROVAL_STATUS.REJECTED]: { color: 'red', icon: <CloseCircleOutlined />, label: 'Rejected' },
  [APPROVAL_STATUS.RETURNED]: { color: 'orange', icon: <RollbackOutlined />, label: 'Returned' },
  [APPROVAL_STATUS.DELEGATED]: { color: 'blue', icon: <SwapOutlined />, label: 'Delegated' },
  [APPROVAL_STATUS.REASSIGNED]: { color: 'cyan', icon: <UserAddOutlined />, label: 'Reassigned' },
  [APPROVAL_STATUS.AUTO_APPROVED]: { color: 'lime', icon: <CheckCircleOutlined />, label: 'Auto Approved' },
};

/**
 * Displays the approval history as a vertical timeline.
 */
export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ tasks, initiator, submittedAt }) => {
  const t = useT();

  const items = [];

  // First item: submission
  if (initiator) {
    items.push({
      color: 'blue',
      children: (
        <Space direction="vertical" size={2}>
          <Space>
            <Avatar size="small">{initiator.nickname?.[0]}</Avatar>
            <Text strong>{initiator.nickname}</Text>
            <Tag color="blue">{t('Initiated')}</Tag>
          </Space>
          {submittedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(submittedAt).toLocaleString()}
            </Text>
          )}
        </Space>
      ),
    });
  }

  // Task items
  for (const task of tasks) {
    const config = statusConfig[task.status] || {
      color: 'gray',
      icon: <ClockCircleOutlined />,
      label: 'Unknown',
    };

    items.push({
      color: config.color,
      dot: config.icon,
      children: (
        <Space direction="vertical" size={2}>
          <Space>
            <Avatar size="small">{task.user?.nickname?.[0] || '?'}</Avatar>
            <Text strong>{task.user?.nickname || `User #${task.userId}`}</Text>
            <Tag color={config.color}>{t(config.label)}</Tag>
          </Space>
          {task.comment && (
            <Paragraph
              style={{ marginBottom: 0, padding: '4px 8px', background: '#f5f5f5', borderRadius: 4 }}
            >
              {task.comment}
            </Paragraph>
          )}
          {task.processedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(task.processedAt).toLocaleString()}
            </Text>
          )}
        </Space>
      ),
    });
  }

  return <Timeline items={items} />;
};

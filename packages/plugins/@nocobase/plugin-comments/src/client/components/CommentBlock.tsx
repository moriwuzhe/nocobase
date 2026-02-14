/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { List, Avatar, Typography, Space, Button, Empty, Spin, Tooltip, Popconfirm } from 'antd';
import { MessageOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAPIClient, useCurrentUserContext, useRecord } from '@nocobase/client';
import { CommentInput } from './CommentInput';

const { Text, Paragraph } = Typography;

interface Comment {
  id: string;
  content: string;
  contentText: string;
  userId: number;
  user?: { id: number; nickname: string; avatar?: string };
  parentId?: string;
  replies?: Comment[];
  mentions?: number[];
  createdAt: string;
  edited: boolean;
  editedAt?: string;
}

interface CommentBlockProps {
  collectionName: string;
  recordId?: string | number;
}

/**
 * CommentBlock - a self-contained comment section that can be added to any record detail page.
 * Loads comments for the given collection + record and supports nested replies.
 */
export const CommentBlock: React.FC<CommentBlockProps> = ({ collectionName, recordId }) => {
  const api = useAPIClient();
  const currentUser = useCurrentUserContext();
  const record = useRecord();
  const targetRecordId = recordId || record?.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(async () => {
    if (!collectionName || !targetRecordId) return;
    setLoading(true);
    try {
      const res = await api.request({
        url: 'comments:listByRecord',
        params: { collectionName, recordId: String(targetRecordId), page, pageSize: 20 },
      });
      const body = res.data?.data || res.data;
      setComments(body?.data || []);
      setTotal(body?.meta?.count || 0);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api, collectionName, targetRecordId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (content: string, mentions: number[], parentId?: string) => {
    if (!content.trim()) return;
    try {
      await api.request({
        url: 'comments:create',
        method: 'POST',
        data: {
          collectionName,
          recordId: String(targetRecordId),
          content,
          contentText: content.replace(/<[^>]*>/g, ''),
          mentions,
          parentId: parentId || null,
        },
      });
      setReplyTo(null);
      fetchComments();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.request({
        url: `comments:destroy/${commentId}`,
        method: 'POST',
      });
      fetchComments();
    } catch {
      // ignore
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isOwn = currentUser?.data?.data?.id === comment.userId;
    return (
      <div key={comment.id} style={{ marginLeft: depth * 40, marginBottom: 16 }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar size={depth === 0 ? 36 : 28}>
            {comment.user?.nickname?.[0] || '?'}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Space size={8}>
              <Text strong style={{ fontSize: depth === 0 ? 14 : 13 }}>
                {comment.user?.nickname || `User #${comment.userId}`}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(comment.createdAt).toLocaleString()}
              </Text>
              {comment.edited && (
                <Tooltip title={comment.editedAt ? new Date(comment.editedAt).toLocaleString() : ''}>
                  <Text type="secondary" style={{ fontSize: 11 }}>(edited)</Text>
                </Tooltip>
              )}
            </Space>
            <Paragraph style={{ marginBottom: 4, marginTop: 4 }}>
              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
            </Paragraph>
            <Space size={16}>
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                Reply
              </Button>
              {isOwn && (
                <Popconfirm title="Delete this comment?" onConfirm={() => handleDelete(comment.id)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Space>
            {replyTo === comment.id && (
              <div style={{ marginTop: 8 }}>
                <CommentInput
                  placeholder={`Reply to ${comment.user?.nickname || 'user'}...`}
                  onSubmit={(content, mentions) => handleSubmit(content, mentions, comment.id)}
                  compact
                />
              </div>
            )}
          </div>
        </Space>
        {/* Nested replies */}
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  if (!collectionName || !targetRecordId) {
    return <Empty description="No record selected" />;
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <Space style={{ marginBottom: 16 }}>
        <MessageOutlined />
        <Text strong style={{ fontSize: 16 }}>
          Comments ({total})
        </Text>
      </Space>

      {/* New comment input */}
      <div style={{ marginBottom: 24 }}>
        <CommentInput
          placeholder="Write a comment..."
          onSubmit={(content, mentions) => handleSubmit(content, mentions)}
        />
      </div>

      {/* Comments list */}
      <Spin spinning={loading}>
        {comments.length === 0 && !loading ? (
          <Empty description="No comments yet. Be the first to comment." />
        ) : (
          <>
            {comments.map((comment) => renderComment(comment))}
            {total > 20 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={comments.length >= total}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Input, Button, Space, Popover, List, Avatar, Typography } from 'antd';
import { SendOutlined, AimOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (content: string, mentions: number[]) => void;
  compact?: boolean;
}

/**
 * CommentInput - a rich comment input box with @mention support.
 */
export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder = 'Write a comment...',
  onSubmit,
  compact = false,
}) => {
  const api = useAPIClient();
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<number[]>([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<any>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(content, mentions);
      setContent('');
      setMentions([]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const searchMentionableUsers = useCallback(
    async (keyword: string) => {
      try {
        const res = await api.request({
          url: 'comments:mentionUsers',
          params: { keyword },
        });
        setMentionResults(res.data?.data || []);
      } catch {
        setMentionResults([]);
      }
    },
    [api],
  );

  const handleMentionSearch = (value: string) => {
    setMentionSearch(value);
    if (value.length > 0) {
      searchMentionableUsers(value);
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const insertMention = (user: any) => {
    const mentionText = `@${user.nickname} `;
    setContent((prev) => prev + mentionText);
    setMentions((prev) => [...new Set([...prev, user.id])]);
    setShowMentionPopover(false);
    setMentionSearch('');
    inputRef.current?.focus();
  };

  const mentionPopoverContent = (
    <div style={{ width: 200, maxHeight: 200, overflow: 'auto' }}>
      <Input
        size="small"
        placeholder="Search users..."
        value={mentionSearch}
        onChange={(e) => handleMentionSearch(e.target.value)}
        autoFocus
        style={{ marginBottom: 8 }}
      />
      <List
        size="small"
        dataSource={mentionResults}
        renderItem={(user: any) => (
          <List.Item style={{ cursor: 'pointer', padding: '4px 8px' }} onClick={() => insertMention(user)}>
            <Space size={8}>
              <Avatar size={20}>{user.nickname?.[0]}</Avatar>
              <Text>{user.nickname}</Text>
            </Space>
          </List.Item>
        )}
        locale={{ emptyText: mentionSearch ? 'No users found' : 'Type to search' }}
      />
    </div>
  );

  return (
    <div>
      <TextArea
        ref={inputRef}
        rows={compact ? 2 : 3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ marginBottom: 8, resize: 'none' }}
      />
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space size={4}>
          <Popover
            content={mentionPopoverContent}
            trigger="click"
            open={showMentionPopover}
            onOpenChange={setShowMentionPopover}
          >
            <Button size="small" type="text" icon={<AimOutlined />} title="Mention someone" />
          </Popover>
          <Button size="small" type="text" icon={<PaperClipOutlined />} title="Attach file" />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Ctrl+Enter to submit
          </Text>
        </Space>
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={submitting}
          disabled={!content.trim()}
        >
          {compact ? '' : 'Comment'}
        </Button>
      </Space>
    </div>
  );
};

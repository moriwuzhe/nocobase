/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import {
  Input, Modal, Table, Typography, Space, Tag, Spin, Alert, Card,
  Empty, Button, Collapse,
} from 'antd';
import { SearchOutlined, RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

/**
 * AISearchBar — a natural language search component.
 * Users type questions in plain language, and the AI translates them
 * into database queries and returns results.
 */
export const AISearchBar: React.FC = () => {
  const api = useAPIClient();
  const [visible, setVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.request({
        url: 'aiSearch:query',
        method: 'POST',
        data: { question },
      });
      const data = res.data?.data;
      if (data?.success) {
        setResult(data);
      } else {
        setError(data?.error || 'Query failed');
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
    }
    setLoading(false);
  };

  const exampleQuestions = [
    'Show me all orders created this month',
    'Find users who haven\'t logged in for 30 days',
    'What are the top 10 most expensive products?',
    'List all pending approval tasks',
    'How many records were created today?',
  ];

  // Build dynamic columns from result data
  const buildColumns = (data: any[]) => {
    if (!data?.length) return [];
    const keys = Object.keys(data[0]).filter((k) => !k.startsWith('_') && k !== 'id');
    return [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      ...keys.slice(0, 8).map((key) => ({
        title: key,
        dataIndex: key,
        key,
        ellipsis: true,
        render: (v: any) => {
          if (v === null || v === undefined) return '-';
          if (typeof v === 'boolean') return v ? 'Yes' : 'No';
          if (typeof v === 'object') return JSON.stringify(v).slice(0, 50);
          return String(v);
        },
      })),
    ];
  };

  return (
    <>
      <Button
        icon={<RobotOutlined />}
        onClick={() => setVisible(true)}
        style={{ borderRadius: 20 }}
      >
        AI Search
      </Button>

      <Modal
        title={<Space><RobotOutlined /> AI Natural Language Search</Space>}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={900}
        style={{ top: 60 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Input */}
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data in natural language..."
              onPressEnter={(e) => { if (e.ctrlKey) handleSearch(); }}
            />
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleSearch}
              loading={loading}
              style={{ height: 'auto' }}
            >
              Ask
            </Button>
          </Space.Compact>

          {/* Example questions */}
          {!result && !loading && !error && (
            <Card size="small">
              <Text type="secondary">Try asking:</Text>
              <div style={{ marginTop: 8 }}>
                {exampleQuestions.map((q) => (
                  <Tag
                    key={q}
                    style={{ cursor: 'pointer', marginBottom: 4 }}
                    onClick={() => { setQuestion(q); }}
                  >
                    {q}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16 }}>AI is analyzing your question...</Paragraph>
            </div>
          )}

          {/* Error */}
          {error && <Alert type="error" message={error} showIcon />}

          {/* Results */}
          {result && (
            <>
              {result.summary && (
                <Alert
                  type="info"
                  message={result.summary}
                  icon={<RobotOutlined />}
                  showIcon
                />
              )}

              <Space>
                <Tag color="blue">{result.query?.collection}</Tag>
                <Text type="secondary">{result.count} result(s)</Text>
              </Space>

              {result.data?.length > 0 ? (
                <Table
                  dataSource={result.data.map((r: any, i: number) => ({ ...r, _key: i }))}
                  columns={buildColumns(result.data)}
                  rowKey="_key"
                  size="small"
                  scroll={{ x: true }}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No matching records found" />
              )}

              {/* Show the generated query */}
              <Collapse
                size="small"
                items={[{
                  key: 'query',
                  label: 'Generated Query (debug)',
                  children: (
                    <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
                      {JSON.stringify(result.query, null, 2)}
                    </pre>
                  ),
                }]}
              />
            </>
          )}
        </Space>
      </Modal>
    </>
  );
};

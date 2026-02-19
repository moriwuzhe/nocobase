/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Modal, List, Tag, Space, Typography, Empty, Spin, Tabs, Button, Tooltip, message } from 'antd';
import { SearchOutlined, ClockCircleOutlined, StarOutlined, StarFilled, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { Plugin, useAPIClient } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { Text, Paragraph } = Typography;

const GlobalSearchModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const api = useAPIClient();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const inputRef = useRef<any>(null);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
      loadHistory();
      loadFavorites();
    }
  }, [visible]);

  const loadHistory = async () => {
    try {
      const res = await api.request({ url: 'globalSearch:getHistory' });
      setHistory(res.data?.data || []);
    } catch { /* ignore */ }
  };

  const loadFavorites = async () => {
    try {
      const res = await api.request({ url: 'globalSearch:getFavorites' });
      setFavorites(res.data?.data || []);
    } catch { /* ignore */ }
  };

  const doSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) { setResults([]); setTotal(0); return; }
    setLoading(true);
    try {
      const res = await api.request({
        url: 'globalSearch:search',
        method: 'POST',
        data: { keyword: kw, pageSize: 30 },
      });
      const data = res.data?.data || {};
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(val), 300);
  };

  const toggleFavorite = async (item: any) => {
    const existing = favorites.find(
      (f) => f.collectionName === item.collectionName && f.recordId === item.recordId,
    );
    if (existing) {
      await api.request({ url: `globalSearch:removeFavorite/${existing.id}`, method: 'POST' });
    } else {
      await api.request({
        url: 'globalSearch:addFavorite',
        method: 'POST',
        data: { collectionName: item.collectionName, recordId: item.recordId, title: item.title },
      });
    }
    loadFavorites();
  };

  const clearAllHistory = async () => {
    await api.request({ url: 'globalSearch:clearHistory', method: 'POST' });
    setHistory([]);
    message.success('History cleared');
  };

  const isFavorited = (item: any) =>
    favorites.some((f) => f.collectionName === item.collectionName && f.recordId === item.recordId);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
      title={null}
      closable={false}
      style={{ top: 80 }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '16px 20px 0' }}>
        <Input
          ref={inputRef}
          size="large"
          prefix={<SearchOutlined />}
          suffix={keyword ? <CloseOutlined onClick={() => { setKeyword(''); setResults([]); }} style={{ cursor: 'pointer' }} /> : null}
          placeholder="Search across all data... (Ctrl+K)"
          value={keyword}
          onChange={onInputChange}
          onPressEnter={() => doSearch(keyword)}
          allowClear={false}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ padding: '0 20px' }}
        items={[
          {
            key: 'search',
            label: `Results${total ? ` (${total})` : ''}`,
            children: (
              <div style={{ maxHeight: 400, overflow: 'auto', paddingBottom: 16 }}>
                <Spin spinning={loading}>
                  {results.length === 0 && !loading ? (
                    <Empty description={keyword ? 'No results found' : 'Type to search'} />
                  ) : (
                    <List
                      size="small"
                      dataSource={results}
                      renderItem={(item: any) => (
                        <List.Item
                          style={{ cursor: 'pointer', padding: '8px 0' }}
                          actions={[
                            <Tooltip title={isFavorited(item) ? 'Unfavorite' : 'Favorite'}>
                              <Button
                                type="text"
                                size="small"
                                icon={isFavorited(item) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                              />
                            </Tooltip>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Tag color="blue" style={{ marginRight: 4 }}>{item.collectionTitle}</Tag>
                                <Text>{item.title}</Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Spin>
              </div>
            ),
          },
          {
            key: 'history',
            label: 'Recent',
            children: (
              <div style={{ maxHeight: 400, overflow: 'auto', paddingBottom: 16 }}>
                {history.length === 0 ? (
                  <Empty description="No recent searches" />
                ) : (
                  <>
                    <div style={{ textAlign: 'right', marginBottom: 8 }}>
                      <Button size="small" type="link" icon={<DeleteOutlined />} onClick={clearAllHistory}>
                        Clear all
                      </Button>
                    </div>
                    <List
                      size="small"
                      dataSource={history}
                      renderItem={(item: any) => (
                        <List.Item
                          style={{ cursor: 'pointer' }}
                          onClick={() => { setKeyword(item.keyword); doSearch(item.keyword); setActiveTab('search'); }}
                        >
                          <Space>
                            <ClockCircleOutlined style={{ color: '#999' }} />
                            <Text>{item.keyword}</Text>
                            <Text type="secondary">({item.resultCount} results)</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </div>
            ),
          },
          {
            key: 'favorites',
            label: `Favorites (${favorites.length})`,
            children: (
              <div style={{ maxHeight: 400, overflow: 'auto', paddingBottom: 16 }}>
                {favorites.length === 0 ? (
                  <Empty description="No favorites yet" />
                ) : (
                  <List
                    size="small"
                    dataSource={favorites}
                    renderItem={(item: any) => (
                      <List.Item
                        actions={[
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => toggleFavorite(item)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Tag>{item.collectionName}</Tag>
                              <Text>{item.title}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export class PluginGlobalSearchClient extends Plugin {
  async load() {
    // Register the search modal as a component
    this.app.addComponents({ GlobalSearchModal });

    // Add keyboard shortcut Ctrl+K to open search
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const event = new CustomEvent('nocobase:global-search-toggle');
          document.dispatchEvent(event);
        }
      });
    }
  }
}

export default PluginGlobalSearchClient;
export { GlobalSearchModal };

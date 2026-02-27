/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Card, Collapse, Input, Typography, Button, message } from 'antd';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LOCAL_DOCS } from './LocalDocs';

const { Title, Paragraph } = Typography;

export function LocalDocsPage() {
  const { t, i18n } = useTranslation();
  const [activeKey, setActiveKey] = useState<string[]>(['quick-reference']);
  const [search, setSearch] = useState('');
  const isZh = i18n.language?.startsWith('zh');

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => message.success(t('Copied')),
        () => message.error(t('Copy failed')),
      );
    },
    [t],
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return Object.entries(LOCAL_DOCS);
    return Object.entries(LOCAL_DOCS).filter(
      ([_, doc]) =>
        (isZh ? doc.title : doc.titleEn).toLowerCase().includes(q) || doc.content.toLowerCase().includes(q),
    );
  }, [search, isZh]);

  const items = filteredItems.map(([key, doc]) => {
    const content = doc.content.trim();
    return {
      key,
      label: isZh ? doc.title : doc.titleEn,
      children: (
        <div>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(content)}
            >
              {t('Copy')}
            </Button>
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              margin: 0,
              padding: 16,
              background: 'var(--nb-box-bg)',
              borderRadius: 4,
            }}
          >
            {content}
          </pre>
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Card>
        <Title level={3}>{t('Local Documentation')}</Title>
        <Paragraph type="secondary">
          {t('Built-in documentation, view offline. For AI learning and reference.')}
        </Paragraph>
        <Input
          placeholder={t('Search documentation')}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
        <Collapse activeKey={activeKey} onChange={(k) => setActiveKey(Array.isArray(k) ? k : [k])} items={items} />
      </Card>
    </div>
  );
}

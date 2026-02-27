/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Card, Collapse, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LOCAL_DOCS } from './LocalDocs';

const { Title, Paragraph } = Typography;

export function LocalDocsPage() {
  const { t, i18n } = useTranslation();
  const [activeKey, setActiveKey] = useState<string[]>(['ui-schema']);
  const isZh = i18n.language?.startsWith('zh');

  const items = Object.entries(LOCAL_DOCS).map(([key, doc]) => ({
    key,
    label: isZh ? doc.title : doc.titleEn,
    children: (
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
        {doc.content.trim()}
      </pre>
    ),
  }));

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Card>
        <Title level={3}>{isZh ? '本地文档' : 'Local Documentation'}</Title>
        <Paragraph type="secondary">
          {isZh
            ? '以下文档已内置，无需联网即可查看。便于 AI 学习和参考。'
            : 'Built-in documentation, view offline. For AI learning and reference.'}
        </Paragraph>
        <Collapse activeKey={activeKey} onChange={(k) => setActiveKey(Array.isArray(k) ? k : [k])} items={items} />
      </Card>
    </div>
  );
}

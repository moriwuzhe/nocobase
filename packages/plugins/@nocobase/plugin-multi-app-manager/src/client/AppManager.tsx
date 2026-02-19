/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { installTemplate, SchemaComponent, useAPIClient, useApp, useRecord } from '@nocobase/client';
import { Card, Radio, Space, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { schema } from './settings/schemas/applications';
import { usePluginUtils } from './utils';
import { JwtSecretInput } from './JwtSecretInput';

const { Text } = Typography;

const templateOptions = [
  { key: '', label: '空白应用', desc: '从零开始搭建', icon: '🔲', color: '#999' },
  {
    key: 'project-management',
    label: '项目管理',
    desc: '11表·10关联·看板+日历+甘特图+工作流+富文本·批量编辑+打印·示例数据',
    icon: '📋',
    color: '#1890ff',
  },
  {
    key: 'crm',
    label: '客户管理 CRM',
    desc: '12表·10关联·看板+日历+甘特图+工作流+URL链接·批量编辑+打印·示例数据',
    icon: '🤝',
    color: '#52c41a',
  },
  {
    key: 'hr',
    label: '人事管理',
    desc: '12表·11关联·看板+日历+甘特图+工作流·批量编辑+打印·示例数据',
    icon: '👥',
    color: '#722ed1',
  },
  {
    key: 'cms',
    label: '内容管理',
    desc: '11表·4关联·看板+日历+工作流+富文本+URL链接·批量编辑+打印·示例数据',
    icon: '📰',
    color: '#fa8c16',
  },
];

const TemplateRadio: React.FC<{ value?: string; onChange?: (v: string) => void }> = ({ value, onChange }) => (
  <Radio.Group value={value || ''} onChange={(e) => onChange?.(e.target.value)} style={{ width: '100%' }}>
    <Space direction="vertical" style={{ width: '100%' }}>
      {templateOptions.map((opt) => (
        <Radio key={opt.key} value={opt.key} style={{ width: '100%' }}>
          <span style={{ marginRight: 8 }}>{opt.icon}</span>
          <Text strong>{opt.label}</Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            {opt.desc}
          </Text>
        </Radio>
      ))}
    </Space>
  </Radio.Group>
);

const useLink = () => {
  const record = useRecord();
  const app = useApp();
  if (record.cname) {
    return `//${record.cname}`;
  }
  return app.getRouteUrl(`/apps/${record.name}/admin/`);
};

const AppVisitor = () => {
  const { t } = usePluginUtils();
  const link = useLink();
  return (
    <a href={link} target={'_blank'} rel="noreferrer">
      {t('View', { ns: 'client' })}
    </a>
  );
};

export const AppManager = () => {
  return (
    <Card bordered={false}>
      <SchemaComponent schema={schema} components={{ AppVisitor, JwtSecretInput, TemplateRadio }} />
    </Card>
  );
};

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { builtInTemplates, installTemplate, SchemaComponent, useAPIClient, useApp, useRecord } from '@nocobase/client';
import { Card, Radio, Space, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { schema } from './settings/schemas/applications';
import { usePluginUtils } from './utils';
import { JwtSecretInput } from './JwtSecretInput';

const { Text } = Typography;

const TEMPLATE_I18N_KEYS: Record<string, { title: string; description: string }> = {
  'project-management': {
    title: 'Built-in template: Project Management',
    description: 'Built-in template: Project Management description',
  },
  crm: { title: 'Built-in template: CRM', description: 'Built-in template: CRM description' },
  hr: { title: 'Built-in template: HR', description: 'Built-in template: HR description' },
  cms: { title: 'Built-in template: CMS', description: 'Built-in template: CMS description' },
};

const TemplateRadio: React.FC<{ value?: string; onChange?: (v: string) => void }> = ({ value, onChange }) => {
  const { t } = usePluginUtils();
  const blankOption = { key: '', icon: '🔲', color: '#999' };
  const builtInOptions = builtInTemplates.map((tpl) => ({
    key: tpl.key,
    icon: tpl.icon,
    color: tpl.color,
    label: TEMPLATE_I18N_KEYS[tpl.key] ? t(TEMPLATE_I18N_KEYS[tpl.key].title) : tpl.title,
    desc: TEMPLATE_I18N_KEYS[tpl.key] ? t(TEMPLATE_I18N_KEYS[tpl.key].description) : tpl.description,
  }));
  const templateOptions = [
    { ...blankOption, label: t('Blank app'), desc: t('Blank app description') },
    ...builtInOptions,
  ];
  return (
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
};

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
    <Card variant="borderless">
      <SchemaComponent schema={schema} components={{ AppVisitor, JwtSecretInput, TemplateRadio }} />
    </Card>
  );
};

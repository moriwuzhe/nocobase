/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Button, Dropdown, App } from 'antd';
import { DownOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAPIClient, useCompile } from '@nocobase/client';
import { WORKFLOW_TEMPLATES } from '../workflowTemplates';
import { getWorkflowDetailPath } from '../utils';
import { NAMESPACE } from '../locale';

export function CreateFromTemplateButton() {
  const { t } = useTranslation(NAMESPACE);
  const api = useAPIClient();
  const navigate = useNavigate();
  const compile = useCompile();
  const { message } = App.useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreate = async (template: (typeof WORKFLOW_TEMPLATES)[0]) => {
    setLoading(template.key);
    try {
      const { data } = await api.request({
        url: 'workflows:create',
        method: 'post',
        data: {
          title: compile(template.title),
          type: template.type,
          sync: template.sync ?? false,
          config: template.config,
          current: true,
        },
      });
      message.success(t('Created successfully'));
      navigate(getWorkflowDetailPath(data?.data?.id));
    } catch (err: any) {
      message.error(err?.message || t('Failed to create'));
    } finally {
      setLoading(null);
    }
  };

  const menuItems = WORKFLOW_TEMPLATES.map((template) => ({
    key: template.key,
    label: compile(template.title),
    onClick: () => handleCreate(template),
  }));

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button icon={<ThunderboltOutlined />} loading={!!loading}>
        {t('Create from template')} <DownOutlined />
      </Button>
    </Dropdown>
  );
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Button, Dropdown, App, Modal, Form, Select } from 'antd';
import { DownOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAPIClient, useCompile, useCollections } from '@nocobase/client';
import { WORKFLOW_TEMPLATES } from '../workflowTemplates';
import { getWorkflowDetailPath } from '../utils';
import { NAMESPACE } from '../locale';

export function CreateFromTemplateButton() {
  const { t } = useTranslation(NAMESPACE);
  const api = useAPIClient();
  const navigate = useNavigate();
  const compile = useCompile();
  const { message } = App.useApp();
  const collections = useCollections((c) => !!c.name && !c.name.startsWith('_'));
  const [loading, setLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof WORKFLOW_TEMPLATES)[0] | null>(null);
  const [form] = Form.useForm();

  const createWorkflow = async (template: (typeof WORKFLOW_TEMPLATES)[0], configOverride?: Record<string, any>) => {
    setLoading(template.key);
    try {
      const config = { ...template.config, ...configOverride };
      const { data } = await api.request({
        url: 'workflows:create',
        method: 'post',
        data: {
          title: compile(template.title),
          type: template.type,
          sync: template.sync ?? false,
          config,
          current: true,
        },
      });
      const workflowId = data?.data?.id;
      if (workflowId && template.nodes?.length) {
        let upstreamId: number | null = null;
        let lastNodeType: string | null = null;
        for (const nodeDef of template.nodes) {
          try {
            const values: Record<string, any> = {
              type: nodeDef.type,
              config: nodeDef.config ?? {},
              upstreamId,
            };
            if (upstreamId != null && lastNodeType === 'condition') {
              values.branchIndex = 0;
            }
            const nodeRes = await api.resource('workflows.nodes', workflowId).create({
              values,
            });
            const created = nodeRes?.data?.data ?? nodeRes?.data;
            upstreamId = created?.id ?? null;
            lastNodeType = nodeDef.type;
          } catch (nodeErr: any) {
            console.warn('Workflow node creation failed:', nodeDef.type, nodeErr?.message);
          }
        }
      }
      message.success(t('Created successfully'));
      navigate(getWorkflowDetailPath(workflowId));
    } catch (err: any) {
      message.error(err?.message || t('Failed to create'));
    } finally {
      setLoading(null);
    }
  };

  const handleSelect = (template: (typeof WORKFLOW_TEMPLATES)[0]) => {
    if (template.type === 'collection' && template.config?.collection == null) {
      setSelectedTemplate(template);
      setModalOpen(true);
      form.resetFields();
    } else {
      createWorkflow(template);
    }
  };

  const handleModalOk = async () => {
    if (!selectedTemplate) return;
    const values = await form.validateFields();
    setModalOpen(false);
    setSelectedTemplate(null);
    await createWorkflow(selectedTemplate, { collection: values.collection });
  };


  const menuItems = WORKFLOW_TEMPLATES.map((template) => ({
    key: template.key,
    label: compile(template.title),
    onClick: () => handleSelect(template),
  }));

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<ThunderboltOutlined />} loading={!!loading}>
          {t('Create from template')} <DownOutlined />
        </Button>
      </Dropdown>
      <Modal
        title={t('Select collection')}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        confirmLoading={!!loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="collection"
            label={t('Collection')}
            rules={[{ required: true, message: t('Please select a collection') }]}
          >
            <Select
              placeholder={t('Select collection')}
              showSearch
              optionFilterProp="label"
              options={(collections ?? []).map((c) => ({
                value: c.name,
                label: c.title || c.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

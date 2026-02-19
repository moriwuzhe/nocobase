/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';
import { NAMESPACE } from '../../common/constants';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'approvalTasks',
  dumpRules: { group: 'log' },
  migrationRules: ['schema-only'],
  shared: true,
  fields: [
    {
      type: 'snowflakeId',
      name: 'id',
      primaryKey: true,
      allowNull: false,
    },
    // --- Associations ---
    {
      type: 'belongsTo',
      name: 'job',
      target: 'jobs',
      foreignKey: 'jobId',
    },
    {
      type: 'belongsTo',
      name: 'user',
      target: 'users',
      foreignKey: 'userId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: `{{t("Approver", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
      },
    },
    {
      type: 'belongsTo',
      name: 'delegatedFrom',
      target: 'users',
      foreignKey: 'delegatedFromId',
    },
    {
      type: 'belongsTo',
      name: 'execution',
      onDelete: 'CASCADE',
    },
    {
      type: 'belongsTo',
      name: 'node',
      target: 'flow_nodes',
    },
    {
      type: 'belongsTo',
      name: 'workflow',
      target: 'workflows',
      foreignKey: 'workflowId',
      onDelete: 'CASCADE',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: `{{t("Workflow", { ns: "workflow" })}}`,
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'title', value: 'id' } },
      },
    },
    {
      type: 'belongsTo',
      name: 'approvalRecord',
      target: 'approvalRecords',
      foreignKey: 'approvalRecordId',
    },
    // --- Data fields ---
    {
      type: 'string',
      name: 'title',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: `{{t("Task title", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'Input',
      },
    },
    {
      type: 'integer',
      name: 'status',
      defaultValue: 0,
    },
    {
      type: 'string',
      name: 'approvalMode',
      defaultValue: 'sequential',
      comment: 'sequential | countersign | or_sign | vote_percentage',
    },
    {
      type: 'integer',
      name: 'order',
      defaultValue: 0,
      comment: 'Order within sequential approval chain',
    },
    {
      type: 'text',
      name: 'comment',
      interface: 'textarea',
      uiSchema: {
        type: 'string',
        title: `{{t("Approval Comment", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'Input.TextArea',
      },
    },
    {
      type: 'jsonb',
      name: 'attachments',
      defaultValue: [],
      comment: 'Attachment file IDs for approval comments',
    },
    {
      type: 'jsonb',
      name: 'result',
    },
    {
      type: 'jsonb',
      name: 'snapshot',
      comment: 'Snapshot of the record data at approval time',
    },
    {
      type: 'date',
      name: 'processedAt',
      comment: 'When the approver actually processed this task',
    },
    {
      type: 'date',
      name: 'deadline',
      comment: 'Task deadline for timeout actions',
    },
    {
      type: 'integer',
      name: 'urgeCount',
      defaultValue: 0,
      comment: 'Number of times this task has been urged',
    },
    {
      type: 'date',
      name: 'lastUrgedAt',
    },
  ],
});

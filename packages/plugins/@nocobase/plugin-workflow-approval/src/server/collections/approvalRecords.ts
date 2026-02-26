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
  logging: true,
  name: 'approvalRecords',
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
    {
      type: 'belongsTo',
      name: 'workflow',
      target: 'workflows',
      foreignKey: 'workflowId',
      onDelete: 'CASCADE',
    },
    {
      type: 'belongsTo',
      name: 'execution',
      onDelete: 'CASCADE',
    },
    {
      type: 'belongsTo',
      name: 'initiator',
      target: 'users',
      foreignKey: 'initiatorId',
    },
    {
      type: 'hasMany',
      name: 'tasks',
      target: 'approvalTasks',
      foreignKey: 'approvalRecordId',
    },
    {
      type: 'string',
      name: 'title',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: `{{t("Approval Title", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'Input',
      },
    },
    {
      type: 'integer',
      name: 'status',
      defaultValue: 0,
      comment: '0=pending, 1=approved, -1=rejected, -2=returned, -3=withdrawn',
    },
    {
      type: 'string',
      name: 'collectionName',
      comment: 'The collection that this approval applies to',
    },
    {
      type: 'string',
      name: 'dataKey',
      comment: 'The primary key value of the record being approved',
    },
    {
      type: 'jsonb',
      name: 'dataSnapshot',
      comment: 'Snapshot of the record at submission time',
    },
    {
      type: 'jsonb',
      name: 'summary',
      defaultValue: {},
      comment: 'Summary fields for quick display in approval list',
    },
    {
      type: 'date',
      name: 'submittedAt',
    },
    {
      type: 'date',
      name: 'completedAt',
    },
  ],
});

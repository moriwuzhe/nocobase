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

/**
 * Approval delegation rules.
 * Allows a user to delegate their approval tasks to another user
 * within a date range (e.g., during leave / business travel).
 */
export default defineCollection({
  logging: true,
  name: 'approvalDelegations',
  dumpRules: { group: 'required' },
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
      name: 'delegator',
      target: 'users',
      foreignKey: 'delegatorId',
      comment: 'The user who delegates their approval authority',
    },
    {
      type: 'belongsTo',
      name: 'delegatee',
      target: 'users',
      foreignKey: 'delegateeId',
      comment: 'The user who receives the delegated authority',
    },
    {
      type: 'date',
      name: 'startDate',
    },
    {
      type: 'date',
      name: 'endDate',
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
    },
    {
      type: 'jsonb',
      name: 'scope',
      defaultValue: {},
      comment: 'Scope filter: which workflows / collections this delegation applies to. Empty = all.',
    },
    {
      type: 'text',
      name: 'reason',
    },
  ],
});

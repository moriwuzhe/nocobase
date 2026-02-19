/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'messageCenter',
  dumpRules: { group: 'log' },
  shared: true,
  fields: [
    { type: 'snowflakeId', name: 'id', primaryKey: true, allowNull: false },
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId' },
    { type: 'string', name: 'category', defaultValue: 'system', comment: 'system|approval|comment|workflow|custom' },
    { type: 'string', name: 'title' },
    { type: 'text', name: 'content' },
    { type: 'string', name: 'level', defaultValue: 'info', comment: 'info|success|warning|error' },
    { type: 'boolean', name: 'read', defaultValue: false },
    { type: 'date', name: 'readAt' },
    { type: 'jsonb', name: 'data', defaultValue: {}, comment: 'Arbitrary payload (link, recordId, etc.)' },
    { type: 'string', name: 'source', comment: 'Plugin name that sent this message' },
  ],
});

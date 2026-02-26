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
  name: 'formRules',
  title: 'Form Rules',
  logging: true,
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'title' },
    { type: 'string', name: 'triggerField' },
    { type: 'string', name: 'triggerOperator', defaultValue: 'eq' },
    { type: 'json', name: 'triggerValue' },
    { type: 'json', name: 'actions', defaultValue: [] },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'sort', defaultValue: 0 },
    { type: 'text', name: 'description' },
  ],
});

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
  name: 'customButtons',
  title: 'Custom Buttons',
  logging: true,
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'title' },
    { type: 'string', name: 'icon', defaultValue: 'ThunderboltOutlined' },
    { type: 'string', name: 'color', defaultValue: 'primary' },
    { type: 'string', name: 'actionType', defaultValue: 'updateField' },
    { type: 'json', name: 'actionConfig', defaultValue: {} },
    { type: 'json', name: 'visibilityCondition' },
    { type: 'boolean', name: 'requireConfirm', defaultValue: false },
    { type: 'string', name: 'confirmMessage' },
    { type: 'json', name: 'roles', defaultValue: [] },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'sort', defaultValue: 0 },
    { type: 'text', name: 'description' },
  ],
});

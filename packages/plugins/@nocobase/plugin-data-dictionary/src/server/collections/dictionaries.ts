/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

/**
 * Data Dictionary - top-level dictionary categories.
 * e.g., "Gender", "Order Status", "Priority Level"
 */
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'dictionaries',
  dumpRules: { group: 'required' },
  migrationRules: ['overwrite'],
  shared: true,
  fields: [
    {
      type: 'string',
      name: 'code',
      unique: true,
      comment: 'Unique code for the dictionary, e.g. "order_status"',
    },
    {
      type: 'string',
      name: 'title',
      comment: 'Display name, e.g. "Order Status"',
    },
    {
      type: 'text',
      name: 'description',
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
    },
    {
      type: 'boolean',
      name: 'system',
      defaultValue: false,
      comment: 'System dictionaries cannot be deleted',
    },
    {
      type: 'hasMany',
      name: 'items',
      target: 'dictionaryItems',
      foreignKey: 'dictionaryId',
      sortBy: 'sort',
    },
  ],
});

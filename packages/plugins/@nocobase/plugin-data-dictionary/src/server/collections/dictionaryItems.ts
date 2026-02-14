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
 * Dictionary Items - individual entries within a dictionary.
 * Supports parent-child cascading via parentId.
 */
export default defineCollection({
  name: 'dictionaryItems',
  dumpRules: { group: 'required' },
  migrationRules: ['overwrite'],
  shared: true,
  fields: [
    {
      type: 'belongsTo',
      name: 'dictionary',
      target: 'dictionaries',
      foreignKey: 'dictionaryId',
    },
    {
      type: 'string',
      name: 'value',
      comment: 'Stored value, e.g. "pending"',
    },
    {
      type: 'string',
      name: 'label',
      comment: 'Display label, e.g. "Pending"',
    },
    {
      type: 'string',
      name: 'color',
      comment: 'Tag color for UI display',
    },
    {
      type: 'string',
      name: 'icon',
      comment: 'Optional icon name',
    },
    {
      type: 'integer',
      name: 'sort',
      defaultValue: 0,
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
    },
    {
      type: 'boolean',
      name: 'isDefault',
      defaultValue: false,
      comment: 'Whether this is the default option',
    },
    // Cascading support
    {
      type: 'belongsTo',
      name: 'parent',
      target: 'dictionaryItems',
      foreignKey: 'parentId',
    },
    {
      type: 'hasMany',
      name: 'children',
      target: 'dictionaryItems',
      foreignKey: 'parentId',
    },
  ],
});

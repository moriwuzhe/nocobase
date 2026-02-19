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
  name: 'searchHistory',
  dumpRules: { group: 'log' },
  shared: true,
  fields: [
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId' },
    { type: 'string', name: 'keyword' },
    { type: 'integer', name: 'resultCount', defaultValue: 0 },
  ],
});

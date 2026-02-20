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
  logging: true,
  name: 'searchFavorites',
  dumpRules: { group: 'log' },
  shared: true,
  fields: [
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId' },
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'recordId' },
    { type: 'string', name: 'title', comment: 'Cached display title' },
    { type: 'string', name: 'description', comment: 'Cached description snippet' },
  ],
});

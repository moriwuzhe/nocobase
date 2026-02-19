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
  name: 'recycleBin',
  title: 'Recycle Bin',
  createdBy: false,
  updatedBy: false,
  updatedAt: false,
  fields: [
    {
      type: 'string',
      name: 'collectionName',
      interface: 'input',
    },
    {
      type: 'string',
      name: 'recordId',
    },
    {
      type: 'text',
      name: 'data',
    },
    {
      type: 'belongsTo',
      name: 'deletedBy',
      target: 'users',
      foreignKey: 'deletedById',
    },
    {
      type: 'date',
      name: 'deletedAt',
    },
  ],
});

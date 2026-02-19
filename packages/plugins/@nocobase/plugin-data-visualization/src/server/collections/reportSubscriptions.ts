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
  name: 'reportSubscriptions',
  title: 'Report Subscriptions',
  fields: [
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId' },
    { type: 'string', name: 'chartId' },
    { type: 'string', name: 'dashboardId' },
    {
      type: 'string',
      name: 'frequency',
      defaultValue: 'weekly',
    },
    {
      type: 'string',
      name: 'channel',
      defaultValue: 'inApp',
    },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'date', name: 'lastSentAt' },
  ],
});

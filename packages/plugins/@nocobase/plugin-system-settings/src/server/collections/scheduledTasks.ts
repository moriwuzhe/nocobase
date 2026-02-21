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
  name: 'scheduledTasks',
  title: 'Scheduled Tasks',
  sortable: true,
  fields: [
    { type: 'string', name: 'name', unique: true },
    { type: 'string', name: 'type' },
    { type: 'integer', name: 'intervalMinutes', defaultValue: 60 },
    { type: 'json', name: 'config', defaultValue: {} },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'date', name: 'lastRunAt' },
    { type: 'string', name: 'lastRunStatus' },
    { type: 'date', name: 'nextRunAt' },
    { type: 'text', name: 'description' },
  ],
});

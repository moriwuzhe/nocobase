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
 * Per-user notification preferences.
 * Controls which categories are delivered via which channels.
 */
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'messagePreferences',
  dumpRules: { group: 'required' },
  shared: true,
  fields: [
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId', unique: true },
    { type: 'boolean', name: 'enableInApp', defaultValue: true },
    { type: 'boolean', name: 'enableEmail', defaultValue: true },
    { type: 'boolean', name: 'enableSms', defaultValue: false },
    { type: 'boolean', name: 'enableDingtalk', defaultValue: false },
    { type: 'boolean', name: 'enableWecom', defaultValue: false },
    { type: 'boolean', name: 'enableFeishu', defaultValue: false },
    { type: 'jsonb', name: 'mutedCategories', defaultValue: [], comment: 'Categories the user has muted' },
    { type: 'boolean', name: 'doNotDisturb', defaultValue: false },
    { type: 'string', name: 'doNotDisturbStart', comment: 'HH:mm format' },
    { type: 'string', name: 'doNotDisturbEnd', comment: 'HH:mm format' },
  ],
});

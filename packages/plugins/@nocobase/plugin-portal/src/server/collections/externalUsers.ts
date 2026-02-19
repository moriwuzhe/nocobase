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
  name: 'externalUsers',
  dumpRules: { group: 'required' },
  migrationRules: ['schema-only'],
  shared: true,
  fields: [
    {
      type: 'snowflakeId',
      name: 'id',
      primaryKey: true,
      allowNull: false,
    },
    {
      type: 'belongsTo',
      name: 'portal',
      target: 'portals',
      foreignKey: 'portalId',
    },
    {
      type: 'string',
      name: 'email',
      unique: true,
    },
    {
      type: 'string',
      name: 'phone',
    },
    {
      type: 'string',
      name: 'nickname',
    },
    {
      type: 'password',
      name: 'password',
      hidden: true,
    },
    {
      type: 'string',
      name: 'avatar',
    },
    {
      type: 'string',
      name: 'company',
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
    },
    {
      type: 'string',
      name: 'role',
      defaultValue: 'member',
      comment: 'Role within the portal: admin, member, viewer',
    },
    {
      type: 'jsonb',
      name: 'profile',
      defaultValue: {},
      comment: 'Custom profile fields',
    },
    {
      type: 'string',
      name: 'externalProvider',
      comment: 'wechat, dingtalk, etc.',
    },
    {
      type: 'string',
      name: 'externalId',
      comment: 'ID from external provider',
    },
    {
      type: 'date',
      name: 'lastLoginAt',
    },
  ],
});

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
  name: 'portals',
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
      type: 'string',
      name: 'name',
      unique: true,
      comment: 'URL slug for the portal (e.g. "customer-portal")',
    },
    {
      type: 'string',
      name: 'title',
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
      type: 'string',
      name: 'customDomain',
      comment: 'Optional custom domain for the portal',
    },
    {
      type: 'jsonb',
      name: 'branding',
      defaultValue: {},
      comment: 'Logo, colors, favicon, custom CSS',
    },
    {
      type: 'jsonb',
      name: 'authConfig',
      defaultValue: {},
      comment: 'Authentication methods: email, phone, wechat, etc.',
    },
    {
      type: 'jsonb',
      name: 'pages',
      defaultValue: [],
      comment: 'Array of page configurations',
    },
    {
      type: 'jsonb',
      name: 'permissions',
      defaultValue: {},
      comment: 'Collection-level permissions for portal users',
    },
    {
      type: 'hasMany',
      name: 'externalUsers',
      target: 'externalUsers',
      foreignKey: 'portalId',
    },
  ],
});

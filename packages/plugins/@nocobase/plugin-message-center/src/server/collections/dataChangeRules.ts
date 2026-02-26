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
  name: 'dataChangeRules',
  title: 'Data Change Notification Rules',
  fields: [
    {
      type: 'string',
      name: 'collectionName',
      interface: 'input',
      uiSchema: { type: 'string', title: 'Collection', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'event',
      defaultValue: 'all',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Event',
        'x-component': 'Select',
        enum: [
          { label: 'All', value: 'all' },
          { label: 'Create', value: 'create' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
        ],
      },
    },
    {
      type: 'string',
      name: 'notifyField',
      interface: 'input',
      uiSchema: { type: 'string', title: 'Notify User Field (e.g. ownerId)', 'x-component': 'Input' },
    },
    {
      type: 'json',
      name: 'notifyRoles',
      defaultValue: [],
    },
    {
      type: 'string',
      name: 'channel',
      defaultValue: 'inApp',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Channel',
        'x-component': 'Select',
        enum: [
          { label: 'In-App', value: 'inApp' },
          { label: 'Email', value: 'email' },
          { label: 'All', value: 'all' },
        ],
      },
    },
    {
      type: 'text',
      name: 'messageTemplate',
      defaultValue: '{{collection}} 的记录 "{{title}}" {{action}}',
      interface: 'textarea',
      uiSchema: { type: 'string', title: 'Message Template', 'x-component': 'Input.TextArea' },
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
      interface: 'checkbox',
    },
  ],
});

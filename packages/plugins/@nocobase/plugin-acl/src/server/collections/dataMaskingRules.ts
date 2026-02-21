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
  name: 'dataMaskingRules',
  title: 'Data Masking Rules',
  sortable: true,
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'collectionName',
      interface: 'input',
      uiSchema: { type: 'string', title: 'Collection', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'fieldName',
      interface: 'input',
      uiSchema: { type: 'string', title: 'Field', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'maskType',
      defaultValue: 'custom',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: 'Mask Type',
        'x-component': 'Select',
        enum: [
          { label: 'Phone (138****1234)', value: 'phone' },
          { label: 'Email (a***z@domain)', value: 'email' },
          { label: 'ID Card (110***1234)', value: 'idCard' },
          { label: 'Bank Account (6222 **** 1234)', value: 'bankAccount' },
          { label: 'Name (张*明)', value: 'name' },
          { label: 'Address (北京市***朝阳)', value: 'address' },
          { label: 'Custom (ab****yz)', value: 'custom' },
        ],
      },
    },
    {
      type: 'json',
      name: 'roles',
      defaultValue: [],
      interface: 'json',
      uiSchema: { type: 'array', title: 'Applicable Roles (empty = all non-admin)', 'x-component': 'Input.TextArea' },
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
      interface: 'checkbox',
      uiSchema: { type: 'boolean', title: 'Enabled', 'x-component': 'Checkbox' },
    },
    {
      type: 'text',
      name: 'description',
      interface: 'textarea',
      uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' },
    },
  ],
});

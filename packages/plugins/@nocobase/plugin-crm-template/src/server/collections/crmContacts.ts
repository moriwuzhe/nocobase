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
  name: 'crmContacts',
  title: 'Contacts',
  fields: [
    { type: 'string', name: 'firstName', interface: 'input', uiSchema: { type: 'string', title: 'First Name', 'x-component': 'Input' } },
    { type: 'string', name: 'lastName', interface: 'input', uiSchema: { type: 'string', title: 'Last Name', 'x-component': 'Input' } },
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Job Title', 'x-component': 'Input' } },
    { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
    { type: 'string', name: 'mobile', interface: 'phone', uiSchema: { type: 'string', title: 'Mobile', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'department', interface: 'input', uiSchema: { type: 'string', title: 'Department', 'x-component': 'Input' } },
    { type: 'boolean', name: 'isPrimary', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Primary Contact', 'x-component': 'Checkbox' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
  ],
});

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
  name: 'crmActivities',
  title: 'Activities',
  fields: [
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Call', value: 'call' }, { label: 'Email', value: 'email' }, { label: 'Meeting', value: 'meeting' }, { label: 'Visit', value: 'visit' }, { label: 'Note', value: 'note' }, { label: 'Task', value: 'task' }] } },
    { type: 'string', name: 'subject', interface: 'input', uiSchema: { type: 'string', title: 'Subject', 'x-component': 'Input' } },
    { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: 'Content', 'x-component': 'RichText' } },
    { type: 'date', name: 'scheduledAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Scheduled At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'date', name: 'completedAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Completed At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'string', name: 'status', defaultValue: 'planned', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Planned', value: 'planned' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'integer', name: 'duration', interface: 'number', uiSchema: { type: 'number', title: 'Duration (min)', 'x-component': 'InputNumber' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'contact', target: 'crmContacts', foreignKey: 'contactId', interface: 'm2o', uiSchema: { type: 'object', title: 'Contact', 'x-component': 'AssociationField' } },
    { type: 'belongsTo', name: 'deal', target: 'crmDeals', foreignKey: 'dealId', interface: 'm2o', uiSchema: { type: 'object', title: 'Related Deal', 'x-component': 'AssociationField' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Owner', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'string', name: 'outcome', interface: 'textarea', uiSchema: { type: 'string', title: 'Outcome', 'x-component': 'Input.TextArea' } },
  ],
});

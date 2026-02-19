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
  name: 'crmCustomers',
  title: 'Customers',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Company Name', 'x-component': 'Input' } },
    { type: 'string', name: 'industry', interface: 'select', uiSchema: { type: 'string', title: 'Industry', 'x-component': 'Select', enum: [{ label: 'Technology', value: 'tech' }, { label: 'Finance', value: 'finance' }, { label: 'Healthcare', value: 'healthcare' }, { label: 'Manufacturing', value: 'manufacturing' }, { label: 'Retail', value: 'retail' }, { label: 'Education', value: 'education' }, { label: 'Other', value: 'other' }] } },
    { type: 'string', name: 'size', interface: 'select', uiSchema: { type: 'string', title: 'Company Size', 'x-component': 'Select', enum: [{ label: '1-10', value: 'xs' }, { label: '11-50', value: 'sm' }, { label: '51-200', value: 'md' }, { label: '201-1000', value: 'lg' }, { label: '1000+', value: 'xl' }] } },
    { type: 'string', name: 'website', interface: 'url', uiSchema: { type: 'string', title: 'Website', 'x-component': 'Input.URL' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
    { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
    { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: 'Address', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'stage', interface: 'select', defaultValue: 'lead', uiSchema: { type: 'string', title: 'Stage', 'x-component': 'Select', enum: [{ label: 'Lead', value: 'lead' }, { label: 'Prospect', value: 'prospect' }, { label: 'Customer', value: 'customer' }, { label: 'Churned', value: 'churned' }] } },
    { type: 'string', name: 'source', interface: 'select', uiSchema: { type: 'string', title: 'Source', 'x-component': 'Select', enum: [{ label: 'Website', value: 'website' }, { label: 'Referral', value: 'referral' }, { label: 'Cold Call', value: 'cold_call' }, { label: 'Event', value: 'event' }, { label: 'Social Media', value: 'social' }] } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Owner', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'hasMany', name: 'contacts', target: 'crmContacts', foreignKey: 'customerId' },
    { type: 'hasMany', name: 'deals', target: 'crmDeals', foreignKey: 'customerId' },
    { type: 'hasMany', name: 'activities', target: 'crmActivities', foreignKey: 'customerId' },
    { type: 'text', name: 'notes', interface: 'richText', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'RichText' } },
  ],
});

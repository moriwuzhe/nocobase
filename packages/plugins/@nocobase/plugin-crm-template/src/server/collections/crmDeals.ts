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
  name: 'crmDeals',
  title: 'Deals',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Deal Name', 'x-component': 'Input' } },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'currency', defaultValue: 'CNY', interface: 'select', uiSchema: { type: 'string', title: 'Currency', 'x-component': 'Select', enum: [{ label: 'CNY ¥', value: 'CNY' }, { label: 'USD $', value: 'USD' }, { label: 'EUR €', value: 'EUR' }] } },
    { type: 'string', name: 'stage', defaultValue: 'qualification', interface: 'select', uiSchema: { type: 'string', title: 'Stage', 'x-component': 'Select', enum: [{ label: 'Qualification', value: 'qualification' }, { label: 'Needs Analysis', value: 'needs_analysis' }, { label: 'Proposal', value: 'proposal' }, { label: 'Negotiation', value: 'negotiation' }, { label: 'Closed Won', value: 'closed_won' }, { label: 'Closed Lost', value: 'closed_lost' }] } },
    { type: 'integer', name: 'probability', defaultValue: 20, interface: 'percent', uiSchema: { type: 'number', title: 'Probability (%)', 'x-component': 'InputNumber', 'x-component-props': { min: 0, max: 100, addonAfter: '%' } } },
    { type: 'date', name: 'expectedCloseDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Expected Close Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'actualCloseDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Actual Close Date', 'x-component': 'DatePicker' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'contact', target: 'crmContacts', foreignKey: 'contactId', interface: 'm2o', uiSchema: { type: 'object', title: 'Contact', 'x-component': 'AssociationField' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Owner', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'string', name: 'lostReason', interface: 'select', uiSchema: { type: 'string', title: 'Lost Reason', 'x-component': 'Select', enum: [{ label: 'Price', value: 'price' }, { label: 'Competitor', value: 'competitor' }, { label: 'No Budget', value: 'no_budget' }, { label: 'No Decision', value: 'no_decision' }, { label: 'Other', value: 'other' }] } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
  ],
});

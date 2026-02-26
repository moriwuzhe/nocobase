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
  title: '{{t("Deals")}}',
  sortable: 'sort',
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Deal Name")}}', 'x-component': 'Input', 'x-validator': 'required' },
    },
    {
      type: 'string',
      name: 'code',
      unique: true,
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Deal Code")}}', 'x-component': 'Input' },
    },
    {
      type: 'float',
      name: 'amount',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Amount")}}',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2, addonBefore: '¥', style: { width: '100%' } },
      },
    },
    {
      type: 'string',
      name: 'currency',
      defaultValue: 'CNY',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Currency")}}',
        'x-component': 'Select',
        enum: [
          { label: 'CNY ¥', value: 'CNY' },
          { label: 'USD $', value: 'USD' },
          { label: 'EUR €', value: 'EUR' },
          { label: 'GBP £', value: 'GBP' },
          { label: 'JPY ¥', value: 'JPY' },
        ],
      },
    },
    {
      type: 'string',
      name: 'stage',
      defaultValue: 'qualification',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Stage")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Qualification")}}', value: 'qualification', color: 'default' },
          { label: '{{t("Needs Analysis")}}', value: 'needs_analysis', color: 'processing' },
          { label: '{{t("Proposal")}}', value: 'proposal', color: 'blue' },
          { label: '{{t("Negotiation")}}', value: 'negotiation', color: 'orange' },
          { label: '{{t("Closed Won")}}', value: 'closed_won', color: 'green' },
          { label: '{{t("Closed Lost")}}', value: 'closed_lost', color: 'red' },
        ],
      },
    },
    {
      type: 'integer',
      name: 'probability',
      defaultValue: 20,
      interface: 'percent',
      uiSchema: {
        type: 'number',
        title: '{{t("Probability (%)")}}',
        'x-component': 'InputNumber',
        'x-component-props': { min: 0, max: 100, addonAfter: '%' },
      },
    },
    {
      type: 'float',
      name: 'weightedAmount',
      interface: 'number',
      uiSchema: {
        type: 'number',
        title: '{{t("Weighted Amount")}}',
        'x-component': 'InputNumber',
        'x-component-props': { precision: 2 },
        'x-read-pretty': true,
      },
    },
    {
      type: 'date',
      name: 'expectedCloseDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Expected Close Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'actualCloseDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Actual Close Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'belongsTo',
      name: 'customer',
      target: 'crmCustomers',
      foreignKey: 'customerId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Customer")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'name', value: 'id' } },
      },
    },
    {
      type: 'belongsTo',
      name: 'contact',
      target: 'crmContacts',
      foreignKey: 'contactId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Primary Contact")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'name', value: 'id' } },
      },
    },
    {
      type: 'belongsTo',
      name: 'owner',
      target: 'users',
      foreignKey: 'ownerId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Owner")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
      },
    },
    {
      type: 'hasMany',
      name: 'quoteItems',
      target: 'crmQuoteItems',
      foreignKey: 'dealId',
    },
    {
      type: 'string',
      name: 'lostReason',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Lost Reason")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Price Too High")}}', value: 'price' },
          { label: '{{t("Competitor Won")}}', value: 'competitor' },
          { label: '{{t("No Budget")}}', value: 'no_budget' },
          { label: '{{t("No Decision")}}', value: 'no_decision' },
          { label: '{{t("Requirements Changed")}}', value: 'requirements' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },
    {
      type: 'text',
      name: 'notes',
      interface: 'textarea',
      uiSchema: { type: 'string', title: '{{t("Notes")}}', 'x-component': 'Input.TextArea' },
    },
    {
      type: 'belongsTo',
      name: 'createdBy',
      target: 'users',
      foreignKey: 'createdById',
    },
    {
      type: 'belongsTo',
      name: 'updatedBy',
      target: 'users',
      foreignKey: 'updatedById',
    },
  ],
});

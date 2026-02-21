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
  title: '{{t("Customers")}}',
  sortable: 'sort',
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Company Name")}}', 'x-component': 'Input', 'x-validator': 'required' },
    },
    {
      type: 'string',
      name: 'code',
      unique: true,
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Customer Code")}}', 'x-component': 'Input', 'x-component-props': { placeholder: 'Auto-generated if empty' } },
    },
    {
      type: 'string',
      name: 'industry',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Industry")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Technology")}}', value: 'tech' },
          { label: '{{t("Finance")}}', value: 'finance' },
          { label: '{{t("Healthcare")}}', value: 'healthcare' },
          { label: '{{t("Manufacturing")}}', value: 'manufacturing' },
          { label: '{{t("Retail")}}', value: 'retail' },
          { label: '{{t("Education")}}', value: 'education' },
          { label: '{{t("Real Estate")}}', value: 'real_estate' },
          { label: '{{t("Consulting")}}', value: 'consulting' },
          { label: '{{t("Other")}}', value: 'other' },
        ],
      },
    },
    {
      type: 'string',
      name: 'size',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Company Size")}}',
        'x-component': 'Select',
        enum: [
          { label: '1-10', value: 'xs' },
          { label: '11-50', value: 'sm' },
          { label: '51-200', value: 'md' },
          { label: '201-1000', value: 'lg' },
          { label: '1000+', value: 'xl' },
        ],
      },
    },
    {
      type: 'string',
      name: 'website',
      interface: 'url',
      uiSchema: { type: 'string', title: '{{t("Website")}}', 'x-component': 'Input.URL' },
    },
    {
      type: 'string',
      name: 'phone',
      interface: 'phone',
      uiSchema: { type: 'string', title: '{{t("Phone")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'email',
      interface: 'email',
      uiSchema: { type: 'string', title: '{{t("Email")}}', 'x-component': 'Input' },
    },
    {
      type: 'text',
      name: 'address',
      interface: 'textarea',
      uiSchema: { type: 'string', title: '{{t("Address")}}', 'x-component': 'Input.TextArea' },
    },
    {
      type: 'string',
      name: 'province',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Province/State")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'city',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("City")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'stage',
      interface: 'select',
      defaultValue: 'lead',
      uiSchema: {
        type: 'string',
        title: '{{t("Stage")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Lead")}}', value: 'lead', color: 'default' },
          { label: '{{t("Prospect")}}', value: 'prospect', color: 'blue' },
          { label: '{{t("Customer")}}', value: 'customer', color: 'green' },
          { label: '{{t("VIP")}}', value: 'vip', color: 'gold' },
          { label: '{{t("Churned")}}', value: 'churned', color: 'red' },
        ],
      },
    },
    {
      type: 'string',
      name: 'source',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Source")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Website")}}', value: 'website' },
          { label: '{{t("Referral")}}', value: 'referral' },
          { label: '{{t("Cold Call")}}', value: 'cold_call' },
          { label: '{{t("Exhibition")}}', value: 'exhibition' },
          { label: '{{t("Social Media")}}', value: 'social' },
          { label: '{{t("Advertisement")}}', value: 'advertisement' },
          { label: '{{t("Partner")}}', value: 'partner' },
        ],
      },
    },
    {
      type: 'string',
      name: 'rating',
      interface: 'select',
      defaultValue: 'B',
      uiSchema: {
        type: 'string',
        title: '{{t("Rating")}}',
        'x-component': 'Select',
        enum: [
          { label: 'A - Key Account', value: 'A', color: 'red' },
          { label: 'B - Important', value: 'B', color: 'orange' },
          { label: 'C - Normal', value: 'C', color: 'blue' },
          { label: 'D - Low Priority', value: 'D', color: 'default' },
        ],
      },
    },
    {
      type: 'float',
      name: 'annualRevenue',
      interface: 'number',
      uiSchema: { type: 'number', title: '{{t("Annual Revenue")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } },
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
      name: 'contacts',
      target: 'crmContacts',
      foreignKey: 'customerId',
    },
    {
      type: 'hasMany',
      name: 'deals',
      target: 'crmDeals',
      foreignKey: 'customerId',
    },
    {
      type: 'hasMany',
      name: 'activities',
      target: 'crmActivities',
      foreignKey: 'customerId',
    },
    {
      type: 'text',
      name: 'notes',
      interface: 'richText',
      uiSchema: { type: 'string', title: '{{t("Notes")}}', 'x-component': 'RichText' },
    },
    {
      type: 'date',
      name: 'nextFollowUpDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Next Follow-up")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'lastContactedAt',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Last Contacted")}}', 'x-component': 'DatePicker', 'x-read-pretty': true },
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

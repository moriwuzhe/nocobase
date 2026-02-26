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
  name: 'pmProjects',
  title: '{{t("Projects")}}',
  sortable: 'sort',
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Project Name")}}', 'x-component': 'Input', 'x-validator': 'required' },
    },
    {
      type: 'string',
      name: 'code',
      unique: true,
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Project Code")}}', 'x-component': 'Input' },
    },
    {
      type: 'text',
      name: 'description',
      interface: 'richText',
      uiSchema: { type: 'string', title: '{{t("Description")}}', 'x-component': 'RichText' },
    },
    {
      type: 'string',
      name: 'type',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Project Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Software Dev")}}', value: 'software' },
          { label: '{{t("Consulting")}}', value: 'consulting' },
          { label: '{{t("Marketing")}}', value: 'marketing' },
          { label: '{{t("Infrastructure")}}', value: 'infrastructure' },
          { label: '{{t("Research")}}', value: 'research' },
          { label: '{{t("Internal")}}', value: 'internal' },
        ],
      },
    },
    {
      type: 'string',
      name: 'status',
      defaultValue: 'planning',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Status")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Planning")}}', value: 'planning', color: 'default' },
          { label: '{{t("In Progress")}}', value: 'in_progress', color: 'processing' },
          { label: '{{t("On Hold")}}', value: 'on_hold', color: 'warning' },
          { label: '{{t("Completed")}}', value: 'completed', color: 'success' },
          { label: '{{t("Cancelled")}}', value: 'cancelled', color: 'error' },
        ],
      },
    },
    {
      type: 'string',
      name: 'priority',
      defaultValue: 'medium',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Priority")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Low")}}', value: 'low', color: 'default' },
          { label: '{{t("Medium")}}', value: 'medium', color: 'blue' },
          { label: '{{t("High")}}', value: 'high', color: 'orange' },
          { label: '{{t("Critical")}}', value: 'critical', color: 'red' },
        ],
      },
    },
    {
      type: 'date',
      name: 'startDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Start Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'endDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("End Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'actualEndDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Actual End Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'float',
      name: 'budget',
      interface: 'number',
      uiSchema: { type: 'number', title: '{{t("Budget")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } },
    },
    {
      type: 'float',
      name: 'actualCost',
      interface: 'number',
      uiSchema: { type: 'number', title: '{{t("Actual Cost")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } },
    },
    {
      type: 'integer',
      name: 'progress',
      defaultValue: 0,
      interface: 'percent',
      uiSchema: { type: 'number', title: '{{t("Progress (%)")}}', 'x-component': 'InputNumber', 'x-component-props': { min: 0, max: 100 } },
    },
    {
      type: 'belongsTo',
      name: 'manager',
      target: 'users',
      foreignKey: 'managerId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Project Manager")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
      },
    },
    {
      type: 'belongsToMany',
      name: 'members',
      target: 'users',
      through: 'pmProjectMembers',
      foreignKey: 'projectId',
      otherKey: 'userId',
    },
    {
      type: 'hasMany',
      name: 'tasks',
      target: 'pmTasks',
      foreignKey: 'projectId',
    },
    {
      type: 'hasMany',
      name: 'milestones',
      target: 'pmMilestones',
      foreignKey: 'projectId',
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

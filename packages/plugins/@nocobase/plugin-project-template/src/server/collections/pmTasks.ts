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
  name: 'pmTasks',
  title: '{{t("Tasks")}}',
  sortable: 'sort',
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'title',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Task Title")}}', 'x-component': 'Input', 'x-validator': 'required' },
    },
    {
      type: 'string',
      name: 'code',
      unique: true,
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Task ID")}}', 'x-component': 'Input' },
    },
    {
      type: 'text',
      name: 'description',
      interface: 'richText',
      uiSchema: { type: 'string', title: '{{t("Description")}}', 'x-component': 'RichText' },
    },
    {
      type: 'belongsTo',
      name: 'project',
      target: 'pmProjects',
      foreignKey: 'projectId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Project")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'name', value: 'id' } },
      },
    },
    {
      type: 'string',
      name: 'type',
      defaultValue: 'task',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Task")}}', value: 'task' },
          { label: '{{t("Bug")}}', value: 'bug' },
          { label: '{{t("Feature")}}', value: 'feature' },
          { label: '{{t("Improvement")}}', value: 'improvement' },
        ],
      },
    },
    {
      type: 'string',
      name: 'status',
      defaultValue: 'todo',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Status")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("To Do")}}', value: 'todo', color: 'default' },
          { label: '{{t("In Progress")}}', value: 'in_progress', color: 'processing' },
          { label: '{{t("In Review")}}', value: 'in_review', color: 'warning' },
          { label: '{{t("Done")}}', value: 'done', color: 'success' },
          { label: '{{t("Blocked")}}', value: 'blocked', color: 'error' },
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
          { label: '{{t("Urgent")}}', value: 'urgent', color: 'red' },
        ],
      },
    },
    {
      type: 'belongsTo',
      name: 'assignee',
      target: 'users',
      foreignKey: 'assigneeId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Assignee")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
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
      name: 'dueDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Due Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'completedAt',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Completed At")}}', 'x-component': 'DatePicker', 'x-read-pretty': true },
    },
    {
      type: 'float',
      name: 'estimatedHours',
      interface: 'number',
      uiSchema: { type: 'number', title: '{{t("Estimated Hours")}}', 'x-component': 'InputNumber', 'x-component-props': { min: 0, precision: 1 } },
    },
    {
      type: 'float',
      name: 'actualHours',
      interface: 'number',
      uiSchema: { type: 'number', title: '{{t("Actual Hours")}}', 'x-component': 'InputNumber', 'x-component-props': { min: 0, precision: 1 } },
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
      name: 'parent',
      target: 'pmTasks',
      foreignKey: 'parentId',
    },
    {
      type: 'belongsTo',
      name: 'milestone',
      target: 'pmMilestones',
      foreignKey: 'milestoneId',
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

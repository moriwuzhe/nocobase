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
  name: 'hrEmployees',
  title: '{{t("Employees")}}',
  sortable: 'sort',
  logging: true,
  fields: [
    {
      type: 'string',
      name: 'employeeId',
      unique: true,
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Employee ID")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Full Name")}}', 'x-component': 'Input', 'x-validator': 'required' },
    },
    {
      type: 'string',
      name: 'email',
      interface: 'email',
      uiSchema: { type: 'string', title: '{{t("Email")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'phone',
      interface: 'phone',
      uiSchema: { type: 'string', title: '{{t("Phone")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'gender',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Gender")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Male")}}', value: 'male' },
          { label: '{{t("Female")}}', value: 'female' },
        ],
      },
    },
    {
      type: 'date',
      name: 'birthDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Birth Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'hireDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Hire Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'probationEndDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Probation End Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'date',
      name: 'resignDate',
      interface: 'datetime',
      uiSchema: { type: 'string', title: '{{t("Resign Date")}}', 'x-component': 'DatePicker' },
    },
    {
      type: 'string',
      name: 'position',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Position")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'level',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Level")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Junior")}}', value: 'junior' },
          { label: '{{t("Mid")}}', value: 'mid' },
          { label: '{{t("Senior")}}', value: 'senior' },
          { label: '{{t("Lead")}}', value: 'lead' },
          { label: '{{t("Manager")}}', value: 'manager' },
          { label: '{{t("Director")}}', value: 'director' },
          { label: '{{t("VP")}}', value: 'vp' },
        ],
      },
    },
    {
      type: 'string',
      name: 'employmentType',
      defaultValue: 'fulltime',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Employment Type")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Full-time")}}', value: 'fulltime' },
          { label: '{{t("Part-time")}}', value: 'parttime' },
          { label: '{{t("Contract")}}', value: 'contract' },
          { label: '{{t("Intern")}}', value: 'intern' },
        ],
      },
    },
    {
      type: 'string',
      name: 'status',
      defaultValue: 'active',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Status")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("Probation")}}', value: 'probation', color: 'warning' },
          { label: '{{t("Active")}}', value: 'active', color: 'success' },
          { label: '{{t("On Leave")}}', value: 'on_leave', color: 'processing' },
          { label: '{{t("Resigned")}}', value: 'resigned', color: 'default' },
          { label: '{{t("Terminated")}}', value: 'terminated', color: 'error' },
        ],
      },
    },
    {
      type: 'string',
      name: 'department',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Department")}}', 'x-component': 'Input' },
    },
    {
      type: 'belongsTo',
      name: 'manager',
      target: 'hrEmployees',
      foreignKey: 'managerId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("Manager")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'name', value: 'id' } },
      },
    },
    {
      type: 'belongsTo',
      name: 'user',
      target: 'users',
      foreignKey: 'userId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: '{{t("User Account")}}',
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
      },
    },
    {
      type: 'text',
      name: 'address',
      interface: 'textarea',
      uiSchema: { type: 'string', title: '{{t("Address")}}', 'x-component': 'Input.TextArea' },
    },
    {
      type: 'string',
      name: 'idNumber',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("ID Number")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'bankAccount',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Bank Account")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'bankName',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Bank Name")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'emergencyContact',
      interface: 'input',
      uiSchema: { type: 'string', title: '{{t("Emergency Contact")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'emergencyPhone',
      interface: 'phone',
      uiSchema: { type: 'string', title: '{{t("Emergency Phone")}}', 'x-component': 'Input' },
    },
    {
      type: 'string',
      name: 'education',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("Education")}}',
        'x-component': 'Select',
        enum: [
          { label: '{{t("High School")}}', value: 'high_school' },
          { label: '{{t("Associate")}}', value: 'associate' },
          { label: '{{t("Bachelor")}}', value: 'bachelor' },
          { label: '{{t("Master")}}', value: 'master' },
          { label: '{{t("PhD")}}', value: 'phd' },
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
      type: 'hasMany',
      name: 'leaveRequests',
      target: 'hrLeaveRequests',
      foreignKey: 'employeeId',
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

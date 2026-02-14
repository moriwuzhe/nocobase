/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { SchemaComponent } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
import { namespace } from '../locale';
import { Instruction } from '@nocobase/plugin-workflow/client';

/**
 * Approval workflow node — client-side configuration UI
 */
export class ApprovalNodeConfig extends Instruction {
  title = tval('Approval', { ns: namespace });
  type = 'approval';
  group = 'manual';
  description = tval('Professional approval node with countersign, or-sign, delegation and more', { ns: namespace });

  fieldset = {
    mode: {
      type: 'string',
      title: tval('Approval Mode', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: [
        { label: tval('Sequential', { ns: namespace }), value: 'sequential' },
        { label: tval('Countersign', { ns: namespace }), value: 'countersign' },
        { label: tval('Or Sign', { ns: namespace }), value: 'or_sign' },
        { label: tval('Vote Percentage', { ns: namespace }), value: 'vote_percentage' },
      ],
      default: 'sequential',
      required: true,
    },
    votePercentage: {
      type: 'number',
      title: tval('Vote Threshold', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      'x-component-props': { min: 1, max: 100, addonAfter: '%' },
      default: 50,
      'x-reactions': {
        dependencies: ['mode'],
        fulfill: {
          state: { visible: '{{$deps[0] === "vote_percentage"}}' },
        },
      },
    },
    assignees: {
      type: 'array',
      title: tval('Assignees', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      required: true,
      items: {
        type: 'void',
        'x-component': 'Space',
        properties: {
          input: {
            type: 'string',
            'x-component': 'WorkflowVariableInput',
            required: true,
          },
          remove: {
            type: 'void',
            'x-component': 'ArrayItems.Remove',
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: '{{t("Add")}}',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    title: {
      type: 'string',
      title: tval('Task title', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
    },
    actions: {
      type: 'array',
      title: '{{t("Allowed actions")}}',
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox.Group',
      enum: [
        { label: tval('Approve', { ns: namespace }), value: 'approve' },
        { label: tval('Reject', { ns: namespace }), value: 'reject' },
        { label: tval('Return', { ns: namespace }), value: 'return' },
        { label: tval('Transfer', { ns: namespace }), value: 'transfer' },
        { label: tval('Add Approver', { ns: namespace }), value: 'addSign' },
        { label: tval('Delegate', { ns: namespace }), value: 'delegate' },
      ],
      default: ['approve', 'reject'],
    },
    allowWithdraw: {
      type: 'boolean',
      title: tval('Allow Withdraw', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: true,
    },
    skipSelfApproval: {
      type: 'boolean',
      title: tval('Skip Self Approval', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
    'timeout.enabled': {
      type: 'boolean',
      title: tval('Enable Timeout', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
    'timeout.duration': {
      type: 'number',
      title: tval('Timeout Duration (minutes)', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      default: 1440,
      'x-reactions': {
        dependencies: ['timeout.enabled'],
        fulfill: {
          state: { visible: '{{$deps[0]}}' },
        },
      },
    },
    'timeout.action': {
      type: 'string',
      title: tval('Timeout Action', { ns: namespace }),
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        { label: tval('Auto Approve', { ns: namespace }), value: 'autoApprove' },
        { label: tval('Auto Reject', { ns: namespace }), value: 'autoReject' },
        { label: tval('Escalate', { ns: namespace }), value: 'escalate' },
        { label: tval('Send Reminder', { ns: namespace }), value: 'remind' },
      ],
      default: 'remind',
      'x-reactions': {
        dependencies: ['timeout.enabled'],
        fulfill: {
          state: { visible: '{{$deps[0]}}' },
        },
      },
    },
  };
}

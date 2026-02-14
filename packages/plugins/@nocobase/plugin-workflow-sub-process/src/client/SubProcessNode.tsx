/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Instruction } from '@nocobase/plugin-workflow/client';
import { tval } from '@nocobase/utils/client';

/**
 * Sub-process workflow node client configuration.
 */
export class SubProcessNodeConfig extends Instruction {
  title = tval('Sub-process');
  type = 'sub-process';
  group = 'control';
  description = tval('Invoke another workflow as a sub-process');

  fieldset = {
    workflowKey: {
      type: 'string',
      title: tval('Target Workflow'),
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowSelect',
      description: tval('Select the workflow to invoke as a sub-process'),
    },
    mode: {
      type: 'string',
      title: tval('Execution Mode'),
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: [
        { label: tval('Synchronous (wait for result)'), value: 'sync' },
        { label: tval('Asynchronous (fire and forget)'), value: 'async' },
      ],
      default: 'sync',
      required: true,
    },
    inputMapping: {
      type: 'object',
      title: tval('Input Mapping'),
      description: tval('Map variables from the current workflow to the sub-process'),
      'x-decorator': 'FormItem',
      'x-component': 'VariableMappingInput',
    },
    outputMapping: {
      type: 'object',
      title: tval('Output Mapping'),
      description: tval('Map the sub-process result back to this workflow'),
      'x-decorator': 'FormItem',
      'x-component': 'VariableMappingInput',
      'x-reactions': {
        dependencies: ['mode'],
        fulfill: {
          state: { visible: '{{$deps[0] === "sync"}}' },
        },
      },
    },
    timeout: {
      type: 'number',
      title: tval('Timeout (seconds)'),
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      'x-component-props': { min: 0 },
      default: 300,
      'x-reactions': {
        dependencies: ['mode'],
        fulfill: {
          state: { visible: '{{$deps[0] === "sync"}}' },
        },
      },
    },
  };
}

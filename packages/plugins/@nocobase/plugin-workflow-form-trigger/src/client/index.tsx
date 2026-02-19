/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import PluginWorkflowClient, { Trigger } from '@nocobase/plugin-workflow/client';
import { tval } from '@nocobase/utils/client';

class FormTriggerConfig extends Trigger {
  title = tval('Form Trigger');
  description = tval('Trigger when a form is submitted');

  fieldset = {
    formKey: {
      type: 'string',
      title: tval('Form Key'),
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      description: tval('Unique identifier for the form. Use this key when calling formTrigger:submit API.'),
    },
    collection: {
      type: 'string',
      title: tval('Collection (optional)'),
      'x-decorator': 'FormItem',
      'x-component': 'CollectionSelect',
      description: tval('If set, the form data will also be saved as a record in this collection.'),
    },
    appends: {
      type: 'array',
      title: tval('Preload relations'),
      'x-decorator': 'FormItem',
      'x-component': 'AppendsTreeSelect',
    },
  };
}

export class PluginWorkflowFormTriggerClient extends Plugin {
  async load() {
    const workflow = this.app.pm.get('workflow') as PluginWorkflowClient;
    workflow.registerTrigger('form', FormTriggerConfig);
  }
}

export default PluginWorkflowFormTriggerClient;

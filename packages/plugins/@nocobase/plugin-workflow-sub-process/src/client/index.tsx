/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import PluginWorkflowClient from '@nocobase/plugin-workflow/client';
import { SubProcessNodeConfig } from './SubProcessNode';

export class PluginWorkflowSubProcessClient extends Plugin {
  async load() {
    const workflow = this.app.pm.get('workflow') as PluginWorkflowClient;
    workflow.registerInstruction('sub-process', SubProcessNodeConfig);
  }
}

export default PluginWorkflowSubProcessClient;

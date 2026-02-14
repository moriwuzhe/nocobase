/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, lazy } from '@nocobase/client';
import PluginWorkflowClient from '@nocobase/plugin-workflow/client';
import { ApprovalNodeConfig } from './components/ApprovalNode';
import { tval } from '@nocobase/utils/client';
import { namespace } from './locale';

const { ApprovalCenter } = lazy(() => import('./components/ApprovalCenter'), 'ApprovalCenter');

export class PluginWorkflowApprovalClient extends Plugin {
  async load() {
    // Register the approval node type in the workflow designer
    const workflow = this.app.pm.get('workflow') as PluginWorkflowClient;
    workflow.registerInstruction('approval', ApprovalNodeConfig);

    // Register approval center page in plugin settings
    this.app.pluginSettingsManager.add('workflow-approval', {
      icon: 'AuditOutlined',
      title: tval('Approval Center', { ns: namespace }),
      Component: ApprovalCenter,
    });
  }
}

export default PluginWorkflowApprovalClient;
export { ApprovalCenter } from './components/ApprovalCenter';
export { ApprovalTimeline } from './components/ApprovalTimeline';

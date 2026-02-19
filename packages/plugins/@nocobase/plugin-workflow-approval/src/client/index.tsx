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
import { ApprovalBlock } from './components/ApprovalBlock';
import { ApprovalTimeline } from './components/ApprovalTimeline';
import { tval } from '@nocobase/utils/client';
import { namespace } from './locale';
import enUS from './locale/en-US';
import zhCN from './locale/zh-CN';

const { ApprovalCenter } = lazy(() => import('./components/ApprovalCenter'), 'ApprovalCenter');
const { DelegationManager } = lazy(() => import('./components/DelegationManager'), 'DelegationManager');
const { WorkflowMonitor } = lazy(() => import('./components/WorkflowMonitor'), 'WorkflowMonitor');

export class PluginWorkflowApprovalClient extends Plugin {
  async load() {
    // i18n
    this.app.i18n.addResources('en-US', namespace, enUS);
    this.app.i18n.addResources('zh-CN', namespace, zhCN);

    // Register components globally
    this.app.addComponents({
      ApprovalBlock,
      ApprovalTimeline,
    });

    // Register the approval node type in the workflow designer
    const workflow = this.app.pm.get('workflow') as PluginWorkflowClient;
    workflow.registerInstruction('approval', ApprovalNodeConfig);

    // Register approval center page
    this.app.pluginSettingsManager.add('workflow-approval', {
      icon: 'AuditOutlined',
      title: tval('Approval', { ns: namespace }),
      aclSnippet: 'pm.plugin-workflow-approval',
    });
    this.app.pluginSettingsManager.add('workflow-approval.center', {
      title: tval('Approval Center', { ns: namespace }),
      Component: ApprovalCenter,
    });
    this.app.pluginSettingsManager.add('workflow-approval.delegation', {
      title: tval('Delegation Rules', { ns: namespace }),
      Component: DelegationManager,
    });
    this.app.pluginSettingsManager.add('workflow-approval.monitor', {
      title: tval('Workflow Monitor', { ns: namespace }),
      Component: WorkflowMonitor,
    });

    // Add ApprovalBlock to page block initializers
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      'otherBlocks.approvalBlock',
      {
        title: tval('Approval Summary', { ns: namespace }),
        Component: 'ApprovalBlockInitializer',
      },
    );
  }
}

export default PluginWorkflowApprovalClient;
export { ApprovalCenter } from './components/ApprovalCenter';
export { ApprovalTimeline } from './components/ApprovalTimeline';
export { ApprovalBlock } from './components/ApprovalBlock';
export { DelegationManager } from './components/DelegationManager';
export { WorkflowMonitor } from './components/WorkflowMonitor';

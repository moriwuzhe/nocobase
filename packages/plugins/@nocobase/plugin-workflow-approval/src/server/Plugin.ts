/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import WorkflowPlugin, { EXECUTION_STATUS } from '@nocobase/plugin-workflow';
import ApprovalInstruction from './ApprovalInstruction';
import * as approvalActions from './actions';
import { TASK_TYPE_APPROVAL, APPROVAL_STATUS } from '../common/constants';

export default class PluginWorkflowApprovalServer extends Plugin {
  private timeoutChecker: NodeJS.Timeout | null = null;

  async load() {
    // Register the approval instruction type with the workflow engine
    const workflowPlugin = this.app.pm.get('workflow') as WorkflowPlugin;
    workflowPlugin.registerInstruction('approval', ApprovalInstruction);

    // Register REST resources and actions
    this.app.resourceManager.define({
      name: 'approvalTasks',
      actions: {
        listMine: approvalActions.listMine,
        submit: approvalActions.submit,
        urge: approvalActions.urge,
        stats: approvalActions.stats,
      },
    });

    this.app.resourceManager.define({
      name: 'approvalRecords',
      actions: {
        withdraw: approvalActions.withdraw,
      },
    });

    this.app.resourceManager.define({
      name: 'approvalDelegations',
    });

    // ACL: allow logged-in users to access their own tasks
    this.app.acl.allow('approvalTasks', ['listMine', 'get', 'submit', 'urge', 'stats'], 'loggedIn');
    this.app.acl.allow('approvalRecords', ['list', 'get', 'withdraw'], 'loggedIn');
    this.app.acl.allow('approvalDelegations', ['list', 'get', 'create', 'update', 'destroy'], 'loggedIn');

    // Register ACL snippets for admin management
    this.app.acl.registerSnippet({
      name: `pm.${this.name}.approval`,
      actions: ['approvalTasks:*', 'approvalRecords:*', 'approvalDelegations:*'],
    });

    // Database hooks for task stats updates
    this.db.on('approvalTasks.afterSave', this.onTaskSave);
    this.db.on('approvalTasks.afterDestroy', this.onTaskSave);

    // Start the timeout checker
    this.startTimeoutChecker();
  }

  /**
   * Update workflow task stats when an approval task changes.
   */
  onTaskSave = async (task, { transaction }) => {
    const workflowPlugin = this.app.pm.get('workflow') as WorkflowPlugin;
    const TaskModel = task.constructor;

    const pending = await TaskModel.count({
      where: {
        userId: task.userId,
        status: APPROVAL_STATUS.PENDING,
      },
      include: [
        {
          association: 'execution',
          attributes: [],
          where: { status: EXECUTION_STATUS.STARTED },
          required: true,
        },
      ],
      col: 'id',
      distinct: true,
      transaction,
    });

    const all = await TaskModel.count({
      where: { userId: task.userId },
      col: 'id',
      transaction,
    });

    await workflowPlugin.updateTasksStats(
      task.userId,
      TASK_TYPE_APPROVAL,
      { pending, all },
      { transaction },
    );
  };

  /**
   * Periodically check for timed-out approval tasks and apply timeout actions.
   */
  startTimeoutChecker() {
    // Check every 60 seconds
    this.timeoutChecker = setInterval(async () => {
      try {
        await this.processTimeouts();
      } catch (err) {
        this.app.logger.error('[approval] Timeout checker error:', err);
      }
    }, 60 * 1000);
  }

  async processTimeouts() {
    const TaskRepo = this.db.getRepository('approvalTasks');
    const now = new Date();

    const timedOutTasks = await TaskRepo.find({
      filter: {
        status: APPROVAL_STATUS.PENDING,
        deadline: { $lt: now },
      },
      appends: ['node'],
    });

    for (const task of timedOutTasks) {
      const config = task.node?.config;
      const timeoutAction = config?.timeout?.action;

      if (!timeoutAction || timeoutAction === 'none') continue;

      switch (timeoutAction) {
        case 'autoApprove':
          await TaskRepo.update({
            filterByTk: task.id,
            values: {
              status: APPROVAL_STATUS.AUTO_APPROVED,
              processedAt: now,
              comment: 'Auto-approved due to timeout',
            },
          });
          break;
        case 'autoReject':
          await TaskRepo.update({
            filterByTk: task.id,
            values: {
              status: APPROVAL_STATUS.REJECTED,
              processedAt: now,
              comment: 'Auto-rejected due to timeout',
            },
          });
          break;
        case 'remind':
          // Send reminder notification
          try {
            const notificationPlugin = this.app.pm.get('notification-manager') as any;
            if (notificationPlugin) {
              await notificationPlugin.sendToUsers?.({
                userIds: [task.userId],
                title: `Overdue: ${task.title}`,
                content: `Your approval task "${task.title}" is overdue. Please process it promptly.`,
              });
            }
          } catch {
            // Ignore
          }
          break;
        case 'escalate':
          // TODO: Implement escalation to superior
          break;
      }
    }
  }

  async remove() {
    if (this.timeoutChecker) {
      clearInterval(this.timeoutChecker);
      this.timeoutChecker = null;
    }
  }
}

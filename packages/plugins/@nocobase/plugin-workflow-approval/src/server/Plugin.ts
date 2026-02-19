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
        batchSubmit: approvalActions.batchSubmit,
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
    this.app.acl.allow('approvalTasks', ['listMine', 'get', 'submit', 'urge', 'stats', 'batchSubmit'], 'loggedIn');
    this.app.acl.allow('approvalRecords', ['list', 'get', 'withdraw'], 'loggedIn');
    this.app.acl.allow('approvalDelegations', ['list', 'get', 'create', 'update', 'destroy'], 'loggedIn');

    this.app.resourceManager.define({
      name: 'workflowMonitor',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const [workflows, executions] = await Promise.all([
            db.getRepository('workflows').find({ fields: ['id', 'title', 'type', 'enabled'] }),
            db.getRepository('executions').find({
              fields: ['id', 'status', 'workflowId', 'createdAt'],
              sort: ['-createdAt'],
              limit: 500,
            }),
          ]);

          const wfList = (workflows || []).map((w: any) => (w.toJSON ? w.toJSON() : w));
          const exList = (executions || []).map((e: any) => (e.toJSON ? e.toJSON() : e));

          const totalWorkflows = wfList.length;
          const enabledWorkflows = wfList.filter((w: any) => w.enabled).length;
          const totalExecutions = exList.length;

          const byStatus: Record<number, number> = {};
          exList.forEach((e: any) => { byStatus[e.status] = (byStatus[e.status] || 0) + 1; });

          const now = Date.now();
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          const todayExecutions = exList.filter((e: any) => new Date(e.createdAt).getTime() > oneDayAgo).length;
          const errorExecutions = exList.filter((e: any) => e.status < 0).length;

          const byWorkflow: Record<string, { title: string; count: number; errors: number }> = {};
          exList.forEach((e: any) => {
            const wf = wfList.find((w: any) => w.id === e.workflowId);
            const key = String(e.workflowId);
            if (!byWorkflow[key]) byWorkflow[key] = { title: wf?.title || `#${key}`, count: 0, errors: 0 };
            byWorkflow[key].count++;
            if (e.status < 0) byWorkflow[key].errors++;
          });

          const topWorkflows = Object.values(byWorkflow)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          const recentErrors = exList
            .filter((e: any) => e.status < 0)
            .slice(0, 10)
            .map((e: any) => {
              const wf = wfList.find((w: any) => w.id === e.workflowId);
              return { id: e.id, workflowTitle: wf?.title || `#${e.workflowId}`, status: e.status, createdAt: e.createdAt };
            });

          ctx.body = {
            totalWorkflows,
            enabledWorkflows,
            totalExecutions,
            todayExecutions,
            errorExecutions,
            byStatus,
            topWorkflows,
            recentErrors,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('workflowMonitor', 'stats', 'loggedIn');

    // Register ACL snippets for admin management
    this.app.acl.registerSnippet({
      name: `pm.${this.name}.approval`,
      actions: ['approvalTasks:*', 'approvalRecords:*', 'approvalDelegations:*', 'workflowMonitor:*'],
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

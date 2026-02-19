/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, Next } from '@nocobase/actions';
import WorkflowPlugin, { JOB_STATUS, EXECUTION_STATUS } from '@nocobase/plugin-workflow';
import { APPROVAL_STATUS, APPROVAL_ACTION } from '../../common/constants';

/**
 * List all approval tasks assigned to the current user.
 */
export async function listMine(context: Context, next: Next) {
  const { currentUser } = context.state;
  const repository = context.db.getRepository('approvalTasks');

  const { filter = {}, ...params } = context.action.params;

  context.body = await repository.find({
    ...params,
    filter: {
      ...filter,
      userId: currentUser.id,
    },
    appends: ['workflow', 'user', 'approvalRecord', 'execution'],
    sort: ['-createdAt'],
  });

  await next();
}

/**
 * Submit an approval decision (approve / reject / return / transfer / addSign).
 */
export async function submit(context: Context, next: Next) {
  const { currentUser } = context.state;
  const { filterByTk, values } = context.action.params;
  const { action, comment, attachments, returnTarget, returnNodeId, transferUserId, addSignUserIds } =
    values || {};

  const repository = context.db.getRepository('approvalTasks');
  const task = await repository.findOne({
    filterByTk,
    appends: ['job', 'node'],
  });

  if (!task) {
    return context.throw(404, 'Approval task not found');
  }

  if (task.userId !== currentUser.id) {
    return context.throw(403, 'You are not the assigned approver for this task');
  }

  if (task.status !== APPROVAL_STATUS.PENDING) {
    return context.throw(400, 'This task has already been processed');
  }

  const workflowPlugin = context.app.pm.get('workflow') as WorkflowPlugin;

  await context.db.sequelize.transaction(async (transaction) => {
    let newStatus: number;

    switch (action) {
      case APPROVAL_ACTION.APPROVE:
        newStatus = APPROVAL_STATUS.APPROVED;
        break;
      case APPROVAL_ACTION.REJECT:
        newStatus = APPROVAL_STATUS.REJECTED;
        break;
      case APPROVAL_ACTION.RETURN:
        newStatus = APPROVAL_STATUS.RETURNED;
        break;
      case APPROVAL_ACTION.TRANSFER:
        newStatus = APPROVAL_STATUS.REASSIGNED;
        // Create a new task for the transfer target
        if (transferUserId) {
          await repository.create({
            values: {
              userId: transferUserId,
              jobId: task.jobId,
              nodeId: task.nodeId,
              executionId: task.executionId,
              workflowId: task.workflowId,
              approvalRecordId: task.approvalRecordId,
              status: APPROVAL_STATUS.PENDING,
              approvalMode: task.approvalMode,
              title: task.title,
              order: task.order,
              delegatedFromId: currentUser.id,
            },
            transaction,
          });
        }
        break;
      case APPROVAL_ACTION.ADD_SIGN:
        // Keep the current task pending, add new tasks for additional approvers
        if (addSignUserIds?.length) {
          const maxOrder = task.order || 0;
          await repository.createMany({
            records: addSignUserIds.map((userId: number, index: number) => ({
              userId,
              jobId: task.jobId,
              nodeId: task.nodeId,
              executionId: task.executionId,
              workflowId: task.workflowId,
              approvalRecordId: task.approvalRecordId,
              status: APPROVAL_STATUS.PENDING,
              approvalMode: task.approvalMode,
              title: task.title,
              order: maxOrder + index + 1,
            })),
            transaction,
          });
        }
        context.body = { success: true, message: 'Additional approvers added' };
        await next();
        return;
      case APPROVAL_ACTION.DELEGATE:
        newStatus = APPROVAL_STATUS.DELEGATED;
        if (transferUserId) {
          await repository.create({
            values: {
              userId: transferUserId,
              jobId: task.jobId,
              nodeId: task.nodeId,
              executionId: task.executionId,
              workflowId: task.workflowId,
              approvalRecordId: task.approvalRecordId,
              status: APPROVAL_STATUS.PENDING,
              approvalMode: task.approvalMode,
              title: task.title,
              order: task.order,
              delegatedFromId: currentUser.id,
            },
            transaction,
          });
        }
        break;
      default:
        return context.throw(400, `Unknown action: ${action}`);
    }

    // Update the current task
    await repository.update({
      filterByTk: task.id,
      values: {
        status: newStatus,
        comment,
        attachments: attachments || [],
        processedAt: new Date(),
        result: { action, comment, returnTarget, returnNodeId },
      },
      transaction,
    });

    // Resume the workflow job
    const job = task.job;
    if (job) {
      job.set({
        status: JOB_STATUS.PENDING,
        result: { ...job.result, latestAction: action, latestUserId: currentUser.id },
      });
      job.latestTask = {
        result: { action, comment },
        status: newStatus,
      };

      workflowPlugin.resume(job);
    }
  });

  context.body = { success: true };
  await next();
}

/**
 * Withdraw an approval (by the initiator).
 */
export async function withdraw(context: Context, next: Next) {
  const { currentUser } = context.state;
  const { filterByTk } = context.action.params;

  const ApprovalRecordRepo = context.db.getRepository('approvalRecords');
  const record = await ApprovalRecordRepo.findOne({
    filterByTk,
  });

  if (!record) {
    return context.throw(404, 'Approval record not found');
  }

  if (record.initiatorId !== currentUser.id) {
    return context.throw(403, 'Only the initiator can withdraw this approval');
  }

  if (record.status !== APPROVAL_STATUS.PENDING) {
    return context.throw(400, 'Cannot withdraw a completed approval');
  }

  await context.db.sequelize.transaction(async (transaction) => {
    // Mark all pending tasks as withdrawn
    const TaskRepo = context.db.getRepository('approvalTasks');
    await TaskRepo.update({
      filter: {
        approvalRecordId: record.id,
        status: APPROVAL_STATUS.PENDING,
      },
      values: {
        status: APPROVAL_STATUS.WITHDRAWN,
        processedAt: new Date(),
      },
      transaction,
    });

    // Update the approval record
    await ApprovalRecordRepo.update({
      filterByTk: record.id,
      values: {
        status: APPROVAL_STATUS.WITHDRAWN,
        completedAt: new Date(),
      },
      transaction,
    });
  });

  context.body = { success: true };
  await next();
}

/**
 * Urge an approver to process their task faster.
 */
export async function urge(context: Context, next: Next) {
  const { filterByTk } = context.action.params;
  const repository = context.db.getRepository('approvalTasks');

  const task = await repository.findOne({ filterByTk });
  if (!task) {
    return context.throw(404, 'Task not found');
  }

  if (task.status !== APPROVAL_STATUS.PENDING) {
    return context.throw(400, 'Can only urge pending tasks');
  }

  await repository.update({
    filterByTk: task.id,
    values: {
      urgeCount: (task.urgeCount || 0) + 1,
      lastUrgedAt: new Date(),
    },
  });

  // Send urge notification
  try {
    const notificationPlugin = context.app.pm.get('notification-manager') as any;
    if (notificationPlugin) {
      await notificationPlugin.sendToUsers?.({
        userIds: [task.userId],
        title: `Reminder: ${task.title}`,
        content: `Please process the approval task: ${task.title}`,
      });
    }
  } catch {
    // Ignore notification errors
  }

  context.body = { success: true };
  await next();
}

/**
 * Get approval statistics for the current user.
 */
export async function stats(context: Context, next: Next) {
  const { currentUser } = context.state;
  const TaskRepo = context.db.getRepository('approvalTasks');

  const pending = await TaskRepo.count({
    filter: { userId: currentUser.id, status: APPROVAL_STATUS.PENDING },
  });

  const approved = await TaskRepo.count({
    filter: { userId: currentUser.id, status: APPROVAL_STATUS.APPROVED },
  });

  const rejected = await TaskRepo.count({
    filter: {
      userId: currentUser.id,
      status: { $in: [APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.RETURNED] },
    },
  });

  const ApprovalRecordRepo = context.db.getRepository('approvalRecords');
  const initiated = await ApprovalRecordRepo.count({
    filter: { initiatorId: currentUser.id },
  });

  context.body = { pending, approved, rejected, initiated };
  await next();
}

/**
 * POST /api/approvalTasks:batchSubmit
 * Body: { taskIds: number[], action: 'approve' | 'reject', comment?: string }
 *
 * Process multiple approval tasks at once.
 */
export async function batchSubmit(context: Context, next: Next) {
  const { currentUser } = context.state;
  const { taskIds, action, comment } = context.action.params.values || {};

  if (!taskIds?.length) return context.throw(400, 'taskIds is required');
  if (!['approve', 'reject'].includes(action)) return context.throw(400, 'action must be approve or reject');

  const repository = context.db.getRepository('approvalTasks');
  const tasks = await repository.find({
    filter: {
      id: { $in: taskIds },
      userId: currentUser.id,
      status: APPROVAL_STATUS.PENDING,
    },
    appends: ['job', 'node'],
  });

  if (tasks.length === 0) {
    context.body = { success: false, processed: 0, message: 'No pending tasks found' };
    return next();
  }

  const workflowPlugin = context.app.pm.get('workflow') as WorkflowPlugin;
  let processed = 0;
  const errors: string[] = [];

  for (const task of tasks) {
    try {
      const newStatus = action === APPROVAL_ACTION.APPROVE
        ? APPROVAL_STATUS.APPROVED
        : APPROVAL_STATUS.REJECTED;

      await repository.update({
        filterByTk: task.id,
        values: {
          status: newStatus,
          comment: comment || `Batch ${action}`,
          processedAt: new Date(),
          result: { action, comment: comment || `Batch ${action}` },
        },
      });

      const job = task.job;
      if (job) {
        job.set({
          status: JOB_STATUS.PENDING,
          result: { ...job.result, latestAction: action, latestUserId: currentUser.id },
        });
        job.latestTask = { result: { action, comment }, status: newStatus };
        workflowPlugin.resume(job);
      }

      processed++;
    } catch (err: any) {
      errors.push(`Task #${task.id}: ${err.message}`);
    }
  }

  context.body = {
    success: true,
    processed,
    total: taskIds.length,
    errors: errors.length > 0 ? errors : undefined,
  };
  await next();
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import WorkflowPlugin, { Processor, JOB_STATUS, Instruction } from '@nocobase/plugin-workflow';
import { getApprovalStrategy } from './strategies';
import {
  APPROVAL_STATUS,
  APPROVAL_MODE,
  APPROVAL_ACTION,
  RETURN_TARGET,
  TIMEOUT_ACTION,
} from '../common/constants';

export interface ApprovalConfig {
  /** Approval mode: sequential, countersign, or_sign, vote_percentage */
  mode: string;
  /** For vote_percentage mode */
  votePercentage?: number;
  /** Assignee user IDs (can be dynamic expressions) */
  assignees: (number | string)[];
  /** Title template (supports variable interpolation) */
  title?: string;
  /** Allowed actions for the approver */
  actions?: string[];
  /** Whether the initiator can withdraw */
  allowWithdraw?: boolean;
  /** Whether to skip when assignee is the initiator */
  skipSelfApproval?: boolean;
  /** Timeout configuration */
  timeout?: {
    enabled: boolean;
    /** Duration in minutes */
    duration: number;
    /** Action on timeout */
    action: string;
    /** For escalate action: the escalation user IDs */
    escalateAssignees?: (number | string)[];
  };
  /** Return-to configuration */
  returnConfig?: {
    /** Allowed return targets */
    allowedTargets: string[];
  };
  /** Summary fields to display in approval list */
  summaryFields?: string[];
  /** Notification channel to use for notifying approvers */
  notificationChannel?: string;
}

export default class ApprovalInstruction extends Instruction {
  constructor(public workflow: WorkflowPlugin) {
    super(workflow);
  }

  /**
   * Called when the approval node is first reached in the workflow execution.
   * Creates approval tasks for all assignees.
   */
  async run(node, prevJob, processor: Processor) {
    const config = node.config as ApprovalConfig;
    const {
      mode = APPROVAL_MODE.SEQUENTIAL,
      skipSelfApproval = false,
    } = config;

    // Resolve dynamic assignees
    let assignees: (string | number)[] = [
      ...new Set<string | number>(
        processor
          .getParsedValue(config.assignees, node.id)
          .flat()
          .filter(Boolean),
      ),
    ];

    // Optionally skip self-approval
    if (skipSelfApproval) {
      const initiatorId = processor.execution?.context?.user?.id;
      if (initiatorId) {
        assignees = assignees.filter((id) => id !== initiatorId);
      }
    }

    // Check delegation rules and replace delegated users
    assignees = await this.applyDelegationRules(assignees, processor);

    // Create the parent job
    const job = processor.saveJob({
      status: assignees.length ? JOB_STATUS.PENDING : JOB_STATUS.RESOLVED,
      result: mode === APPROVAL_MODE.SEQUENTIAL ? [] : null,
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: prevJob?.id ?? null,
    });

    if (!assignees.length) {
      return job;
    }

    const title = config.title
      ? processor.getParsedValue(config.title, node.id)
      : node.title;

    // Create approval record (the overall approval instance)
    const ApprovalRecordRepo = this.workflow.app.db.getRepository('approvalRecords');
    const approvalRecord = await ApprovalRecordRepo.create({
      values: {
        workflowId: node.workflowId,
        executionId: job.executionId,
        initiatorId: processor.execution?.context?.user?.id,
        title,
        status: APPROVAL_STATUS.PENDING,
        submittedAt: new Date(),
      },
      transaction: processor.mainTransaction,
    });

    // Create individual approval tasks
    const TaskRepo = this.workflow.app.db.getRepository('approvalTasks');
    const now = new Date();
    const deadline = config.timeout?.enabled
      ? new Date(now.getTime() + config.timeout.duration * 60 * 1000)
      : null;

    await TaskRepo.createMany({
      records: assignees.map((userId, index) => ({
        userId,
        jobId: job.id,
        nodeId: node.id,
        executionId: job.executionId,
        workflowId: node.workflowId,
        approvalRecordId: approvalRecord.id,
        status: APPROVAL_STATUS.PENDING,
        approvalMode: mode,
        title,
        order: index,
        deadline,
      })),
      transaction: processor.mainTransaction,
    });

    // Send notifications to approvers
    await this.notifyApprovers(assignees, {
      title,
      workflowId: node.workflowId,
      approvalRecordId: approvalRecord.id,
      notificationChannel: config.notificationChannel,
    });

    return job;
  }

  /**
   * Called when an approver submits their decision.
   * Evaluates the approval strategy to determine if the workflow should continue.
   */
  async resume(node, job, processor: Processor) {
    const config = node.config as ApprovalConfig;
    const { mode = APPROVAL_MODE.SEQUENTIAL } = config;

    const TaskRepo = this.workflow.app.db.getRepository('approvalTasks');
    const tasks = await TaskRepo.find({
      where: { jobId: job.id },
      transaction: processor.mainTransaction,
    });

    const strategy = getApprovalStrategy(mode);
    const taskData = tasks.map((t) => ({
      status: t.status,
      userId: t.userId,
    }));

    const status = strategy.getStatus(taskData, config) ?? JOB_STATUS.PENDING;

    // For sequential mode: check if next approver should be activated
    if (mode === APPROVAL_MODE.SEQUENTIAL && status === null) {
      await this.activateNextSequentialApprover(tasks, processor);
    }

    // Build result summary
    const result = {
      mode,
      totalApprovers: tasks.length,
      approved: tasks.filter(
        (t) =>
          t.status === APPROVAL_STATUS.APPROVED ||
          t.status === APPROVAL_STATUS.AUTO_APPROVED,
      ).length,
      rejected: tasks.filter(
        (t) =>
          t.status === APPROVAL_STATUS.REJECTED ||
          t.status === APPROVAL_STATUS.RETURNED,
      ).length,
      pending: tasks.filter((t) => t.status === APPROVAL_STATUS.PENDING).length,
      tasks: tasks.map((t) => ({
        userId: t.userId,
        status: t.status,
        comment: t.comment,
        processedAt: t.processedAt,
      })),
    };

    processor.logger.debug(
      `approval resume job, mode=${mode}, status=${status}`,
    );

    job.set({ status, result });

    // Update approval record status
    if (status !== JOB_STATUS.PENDING) {
      const ApprovalRecordRepo =
        this.workflow.app.db.getRepository('approvalRecords');
      const approvalTask = tasks[0];
      if (approvalTask?.approvalRecordId) {
        await ApprovalRecordRepo.update({
          filter: { id: approvalTask.approvalRecordId },
          values: {
            status:
              status === JOB_STATUS.RESOLVED
                ? APPROVAL_STATUS.APPROVED
                : APPROVAL_STATUS.REJECTED,
            completedAt: new Date(),
          },
          transaction: processor.mainTransaction,
        });
      }
    }

    return job;
  }

  /**
   * Apply delegation rules: if a user has an active delegation,
   * replace them with their delegatee.
   */
  private async applyDelegationRules(
    assignees: (number | string)[],
    processor: Processor,
  ): Promise<(number | string)[]> {
    const DelegationRepo =
      this.workflow.app.db.getRepository('approvalDelegations');
    const now = new Date();

    const result: (number | string)[] = [];
    for (const userId of assignees) {
      const delegation = await DelegationRepo.findOne({
        filter: {
          delegatorId: userId,
          enabled: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        },
        transaction: processor.mainTransaction,
      });

      if (delegation) {
        result.push(delegation.delegateeId);
      } else {
        result.push(userId);
      }
    }

    return [...new Set(result)];
  }

  /**
   * For sequential approval: activate the next pending approver
   * by sending them a notification.
   */
  private async activateNextSequentialApprover(
    tasks: any[],
    processor: Processor,
  ) {
    const pendingTasks = tasks
      .filter((t) => t.status === APPROVAL_STATUS.PENDING)
      .sort((a, b) => a.order - b.order);

    if (pendingTasks.length > 0) {
      const nextTask = pendingTasks[0];
      // Notification logic for next approver
      processor.logger.debug(
        `Sequential approval: activating approver ${nextTask.userId}`,
      );
    }
  }

  /**
   * Send notifications to approvers via the configured notification channel.
   */
  private async notifyApprovers(
    assignees: (number | string)[],
    options: {
      title: string;
      workflowId: number | string;
      approvalRecordId: number | string;
      notificationChannel?: string;
    },
  ) {
    try {
      const notificationPlugin = this.workflow.app.pm.get(
        'notification-manager',
      ) as any;
      if (!notificationPlugin) return;

      for (const userId of assignees) {
        await notificationPlugin.sendToUsers?.({
          userIds: [userId],
          channels: options.notificationChannel
            ? [options.notificationChannel]
            : undefined,
          title: `New Approval: ${options.title}`,
          content: `You have a new approval task: ${options.title}`,
          data: {
            type: 'approval',
            approvalRecordId: options.approvalRecordId,
            workflowId: options.workflowId,
          },
        });
      }
    } catch (err) {
      // Notification failure should not block the workflow
      this.workflow.getLogger('approval').warn('Failed to send approval notification', err);
    }
  }
}

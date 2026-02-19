/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { JOB_STATUS } from '@nocobase/plugin-workflow';
import { APPROVAL_STATUS, APPROVAL_MODE } from '../../common/constants';

export interface ApprovalStrategy {
  /**
   * Determine the overall approval status based on individual task statuses.
   * @param tasks - Array of { status, userId } for all tasks in this node
   * @param config - Node configuration (e.g., votePercentage)
   * @returns The resolved JOB_STATUS, or null if still pending
   */
  getStatus(
    tasks: Array<{ status: number; userId: number }>,
    config?: Record<string, any>,
  ): number | null;
}

/**
 * Sequential: tasks are processed one by one in order.
 * The first rejection stops the chain.
 */
export const SequentialStrategy: ApprovalStrategy = {
  getStatus(tasks) {
    // Find the first non-pending task result
    const rejected = tasks.find((t) => t.status === APPROVAL_STATUS.REJECTED);
    if (rejected) return JOB_STATUS.REJECTED;

    const returned = tasks.find((t) => t.status === APPROVAL_STATUS.RETURNED);
    if (returned) return JOB_STATUS.REJECTED; // Return also halts the flow

    const allApproved = tasks.every(
      (t) =>
        t.status === APPROVAL_STATUS.APPROVED ||
        t.status === APPROVAL_STATUS.AUTO_APPROVED ||
        t.status === APPROVAL_STATUS.SKIPPED,
    );
    if (allApproved && tasks.length > 0) return JOB_STATUS.RESOLVED;

    return null; // Still pending
  },
};

/**
 * Countersign (会签): ALL approvers must approve.
 * Any single rejection means the whole approval is rejected.
 */
export const CountersignStrategy: ApprovalStrategy = {
  getStatus(tasks) {
    const rejected = tasks.find(
      (t) => t.status === APPROVAL_STATUS.REJECTED || t.status === APPROVAL_STATUS.RETURNED,
    );
    if (rejected) return JOB_STATUS.REJECTED;

    const allDone = tasks.every((t) => t.status !== APPROVAL_STATUS.PENDING);
    if (allDone && tasks.length > 0) return JOB_STATUS.RESOLVED;

    return null;
  },
};

/**
 * Or-sign (或签): ANY one approver is sufficient.
 * One approval = approved. All rejections = rejected.
 */
export const OrSignStrategy: ApprovalStrategy = {
  getStatus(tasks) {
    const approved = tasks.find(
      (t) =>
        t.status === APPROVAL_STATUS.APPROVED ||
        t.status === APPROVAL_STATUS.AUTO_APPROVED,
    );
    if (approved) return JOB_STATUS.RESOLVED;

    const allRejected = tasks.every(
      (t) =>
        t.status === APPROVAL_STATUS.REJECTED ||
        t.status === APPROVAL_STATUS.RETURNED,
    );
    if (allRejected && tasks.length > 0) return JOB_STATUS.REJECTED;

    return null;
  },
};

/**
 * Vote percentage (票签): Approval passes when the approved ratio >= threshold.
 * config.votePercentage: number (0-100), e.g., 60 means 60% approval needed.
 */
export const VotePercentageStrategy: ApprovalStrategy = {
  getStatus(tasks, config) {
    const threshold = (config?.votePercentage ?? 50) / 100;
    const total = tasks.length;
    if (total === 0) return null;

    const approvedCount = tasks.filter(
      (t) =>
        t.status === APPROVAL_STATUS.APPROVED ||
        t.status === APPROVAL_STATUS.AUTO_APPROVED ||
        t.status === APPROVAL_STATUS.SKIPPED,
    ).length;

    const rejectedCount = tasks.filter(
      (t) =>
        t.status === APPROVAL_STATUS.REJECTED ||
        t.status === APPROVAL_STATUS.RETURNED,
    ).length;

    const pendingCount = tasks.filter((t) => t.status === APPROVAL_STATUS.PENDING).length;

    if (approvedCount / total >= threshold) return JOB_STATUS.RESOLVED;
    // If even all remaining pending tasks approve, it still can't reach threshold
    if ((approvedCount + pendingCount) / total < threshold) return JOB_STATUS.REJECTED;

    return null;
  },
};

const strategyMap: Record<string, ApprovalStrategy> = {
  [APPROVAL_MODE.SEQUENTIAL]: SequentialStrategy,
  [APPROVAL_MODE.COUNTERSIGN]: CountersignStrategy,
  [APPROVAL_MODE.OR_SIGN]: OrSignStrategy,
  [APPROVAL_MODE.VOTE_PERCENTAGE]: VotePercentageStrategy,
};

export function getApprovalStrategy(mode: string): ApprovalStrategy {
  return strategyMap[mode] || SequentialStrategy;
}

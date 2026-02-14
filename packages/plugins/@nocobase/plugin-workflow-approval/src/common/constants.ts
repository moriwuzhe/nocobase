/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export const NAMESPACE = 'workflow-approval';

export const TASK_TYPE_APPROVAL = 'approval';

/**
 * Approval modes:
 * - SEQUENTIAL: Approvers process in order, one at a time
 * - COUNTERSIGN: All approvers must approve (AND logic)
 * - OR_SIGN: Any one approver is sufficient (OR logic)
 * - VOTE_PERCENTAGE: Approval passes when a percentage threshold is met
 */
export const APPROVAL_MODE = {
  SEQUENTIAL: 'sequential',
  COUNTERSIGN: 'countersign',
  OR_SIGN: 'or_sign',
  VOTE_PERCENTAGE: 'vote_percentage',
} as const;

/**
 * Status of individual approval tasks
 */
export const APPROVAL_STATUS = {
  /** Waiting for the approver to act */
  PENDING: 0,
  /** Approved / Resolved */
  APPROVED: 1,
  /** Rejected */
  REJECTED: -1,
  /** Returned to a previous node or to the initiator */
  RETURNED: -2,
  /** Delegated to another user */
  DELEGATED: 2,
  /** Re-assigned via countersign addition */
  REASSIGNED: 3,
  /** Withdrawn by the initiator */
  WITHDRAWN: -3,
  /** Automatically approved (timeout / delegation rule) */
  AUTO_APPROVED: 4,
  /** Skipped (e.g. approver is also the initiator, skip self-approval) */
  SKIPPED: 5,
} as const;

/**
 * Actions an approver can take
 */
export const APPROVAL_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
  RETURN: 'return',
  /** Transfer to another approver (replacing self) */
  TRANSFER: 'transfer',
  /** Add additional approvers without replacing self */
  ADD_SIGN: 'addSign',
  /** Delegate to another user temporarily */
  DELEGATE: 'delegate',
  /** Urge the current approver to process */
  URGE: 'urge',
} as const;

/**
 * Return-to target types
 */
export const RETURN_TARGET = {
  /** Return to the previous approval node */
  PREVIOUS_NODE: 'previousNode',
  /** Return to the initiator / start of workflow */
  INITIATOR: 'initiator',
  /** Return to a specific node (by nodeId) */
  SPECIFIC_NODE: 'specificNode',
} as const;

/**
 * Timeout actions
 */
export const TIMEOUT_ACTION = {
  /** No action on timeout */
  NONE: 'none',
  /** Auto-approve on timeout */
  AUTO_APPROVE: 'autoApprove',
  /** Auto-reject on timeout */
  AUTO_REJECT: 'autoReject',
  /** Escalate to a superior */
  ESCALATE: 'escalate',
  /** Send reminder notification */
  REMIND: 'remind',
} as const;

export const ApprovalStatusOptions = [
  { value: APPROVAL_STATUS.PENDING, label: `{{t("Pending", { ns: "${NAMESPACE}" })}}`, color: 'gold' },
  { value: APPROVAL_STATUS.APPROVED, label: `{{t("Approved", { ns: "${NAMESPACE}" })}}`, color: 'green' },
  { value: APPROVAL_STATUS.REJECTED, label: `{{t("Rejected", { ns: "${NAMESPACE}" })}}`, color: 'red' },
  { value: APPROVAL_STATUS.RETURNED, label: `{{t("Returned", { ns: "${NAMESPACE}" })}}`, color: 'orange' },
  { value: APPROVAL_STATUS.DELEGATED, label: `{{t("Delegated", { ns: "${NAMESPACE}" })}}`, color: 'blue' },
  { value: APPROVAL_STATUS.REASSIGNED, label: `{{t("Reassigned", { ns: "${NAMESPACE}" })}}`, color: 'cyan' },
  { value: APPROVAL_STATUS.WITHDRAWN, label: `{{t("Withdrawn", { ns: "${NAMESPACE}" })}}`, color: 'default' },
  { value: APPROVAL_STATUS.AUTO_APPROVED, label: `{{t("Auto Approved", { ns: "${NAMESPACE}" })}}`, color: 'lime' },
  { value: APPROVAL_STATUS.SKIPPED, label: `{{t("Skipped", { ns: "${NAMESPACE}" })}}`, color: 'default' },
];

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { JOB_STATUS } from '@nocobase/plugin-workflow';
import {
  SequentialStrategy,
  CountersignStrategy,
  OrSignStrategy,
  VotePercentageStrategy,
  getApprovalStrategy,
} from '../strategies';
import { APPROVAL_STATUS, APPROVAL_MODE } from '../../common/constants';

describe('Approval Strategies', () => {
  describe('SequentialStrategy', () => {
    it('should return null when tasks are still pending', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.PENDING, userId: 2 },
        { status: APPROVAL_STATUS.PENDING, userId: 3 },
      ];
      expect(SequentialStrategy.getStatus(tasks)).toBeNull();
    });

    it('should return RESOLVED when all tasks are approved', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.APPROVED, userId: 3 },
      ];
      expect(SequentialStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return REJECTED when any task is rejected', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.REJECTED, userId: 2 },
        { status: APPROVAL_STATUS.PENDING, userId: 3 },
      ];
      expect(SequentialStrategy.getStatus(tasks)).toBe(JOB_STATUS.REJECTED);
    });

    it('should return REJECTED when any task is returned', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.RETURNED, userId: 2 },
      ];
      expect(SequentialStrategy.getStatus(tasks)).toBe(JOB_STATUS.REJECTED);
    });

    it('should count AUTO_APPROVED and SKIPPED as approved', () => {
      const tasks = [
        { status: APPROVAL_STATUS.AUTO_APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.SKIPPED, userId: 2 },
        { status: APPROVAL_STATUS.APPROVED, userId: 3 },
      ];
      expect(SequentialStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return null for empty tasks', () => {
      expect(SequentialStrategy.getStatus([])).toBeNull();
    });
  });

  describe('CountersignStrategy (AND logic)', () => {
    it('should return null when some tasks are pending', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.PENDING, userId: 2 },
      ];
      expect(CountersignStrategy.getStatus(tasks)).toBeNull();
    });

    it('should return RESOLVED when ALL approve', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.APPROVED, userId: 3 },
      ];
      expect(CountersignStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return REJECTED immediately when one rejects (veto)', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.REJECTED, userId: 2 },
        { status: APPROVAL_STATUS.PENDING, userId: 3 },
      ];
      expect(CountersignStrategy.getStatus(tasks)).toBe(JOB_STATUS.REJECTED);
    });

    it('should return REJECTED if any task is returned', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.RETURNED, userId: 2 },
      ];
      expect(CountersignStrategy.getStatus(tasks)).toBe(JOB_STATUS.REJECTED);
    });
  });

  describe('OrSignStrategy (OR logic)', () => {
    it('should return RESOLVED when ANY one approves', () => {
      const tasks = [
        { status: APPROVAL_STATUS.PENDING, userId: 1 },
        { status: APPROVAL_STATUS.APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.PENDING, userId: 3 },
      ];
      expect(OrSignStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return null when no one has approved yet and some are pending', () => {
      const tasks = [
        { status: APPROVAL_STATUS.REJECTED, userId: 1 },
        { status: APPROVAL_STATUS.PENDING, userId: 2 },
      ];
      expect(OrSignStrategy.getStatus(tasks)).toBeNull();
    });

    it('should return REJECTED only when ALL reject', () => {
      const tasks = [
        { status: APPROVAL_STATUS.REJECTED, userId: 1 },
        { status: APPROVAL_STATUS.REJECTED, userId: 2 },
        { status: APPROVAL_STATUS.RETURNED, userId: 3 },
      ];
      expect(OrSignStrategy.getStatus(tasks)).toBe(JOB_STATUS.REJECTED);
    });

    it('should return RESOLVED for AUTO_APPROVED', () => {
      const tasks = [
        { status: APPROVAL_STATUS.PENDING, userId: 1 },
        { status: APPROVAL_STATUS.AUTO_APPROVED, userId: 2 },
      ];
      expect(OrSignStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });
  });

  describe('VotePercentageStrategy', () => {
    it('should return RESOLVED when approval rate >= threshold', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.REJECTED, userId: 3 },
        { status: APPROVAL_STATUS.PENDING, userId: 4 },
      ];
      // 2/4 = 50%, threshold 50%
      expect(VotePercentageStrategy.getStatus(tasks, { votePercentage: 50 })).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return null when result is still uncertain', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.PENDING, userId: 2 },
        { status: APPROVAL_STATUS.PENDING, userId: 3 },
        { status: APPROVAL_STATUS.PENDING, userId: 4 },
      ];
      // 1/4 = 25% approved, but (1+3)/4 = 100% potential → still possible
      expect(VotePercentageStrategy.getStatus(tasks, { votePercentage: 60 })).toBeNull();
    });

    it('should return REJECTED when mathematically impossible to reach threshold', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.REJECTED, userId: 2 },
        { status: APPROVAL_STATUS.REJECTED, userId: 3 },
        { status: APPROVAL_STATUS.REJECTED, userId: 4 },
      ];
      // 1/4 = 25% approved, 0 pending, can't reach 60%
      expect(VotePercentageStrategy.getStatus(tasks, { votePercentage: 60 })).toBe(JOB_STATUS.REJECTED);
    });

    it('should default to 50% when no threshold configured', () => {
      const tasks = [
        { status: APPROVAL_STATUS.APPROVED, userId: 1 },
        { status: APPROVAL_STATUS.APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.REJECTED, userId: 3 },
        { status: APPROVAL_STATUS.REJECTED, userId: 4 },
      ];
      // 2/4 = 50%, default threshold 50%
      expect(VotePercentageStrategy.getStatus(tasks)).toBe(JOB_STATUS.RESOLVED);
    });

    it('should return null for empty tasks', () => {
      expect(VotePercentageStrategy.getStatus([], { votePercentage: 50 })).toBeNull();
    });

    it('should count SKIPPED and AUTO_APPROVED as approved', () => {
      const tasks = [
        { status: APPROVAL_STATUS.SKIPPED, userId: 1 },
        { status: APPROVAL_STATUS.AUTO_APPROVED, userId: 2 },
        { status: APPROVAL_STATUS.REJECTED, userId: 3 },
      ];
      // 2/3 = 66.7%, threshold 60%
      expect(VotePercentageStrategy.getStatus(tasks, { votePercentage: 60 })).toBe(JOB_STATUS.RESOLVED);
    });
  });

  describe('getApprovalStrategy', () => {
    it('should return correct strategy for each mode', () => {
      expect(getApprovalStrategy(APPROVAL_MODE.SEQUENTIAL)).toBe(SequentialStrategy);
      expect(getApprovalStrategy(APPROVAL_MODE.COUNTERSIGN)).toBe(CountersignStrategy);
      expect(getApprovalStrategy(APPROVAL_MODE.OR_SIGN)).toBe(OrSignStrategy);
      expect(getApprovalStrategy(APPROVAL_MODE.VOTE_PERCENTAGE)).toBe(VotePercentageStrategy);
    });

    it('should default to SequentialStrategy for unknown mode', () => {
      expect(getApprovalStrategy('unknown')).toBe(SequentialStrategy);
    });
  });
});

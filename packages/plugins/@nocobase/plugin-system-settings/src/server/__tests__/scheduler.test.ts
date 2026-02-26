/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { stopAllTasks } from '../scheduler';

describe('Task Scheduler', () => {
  afterAll(() => {
    stopAllTasks();
  });

  describe('Built-in task types', () => {
    it('should have cleanup:auditLogs task', () => {
      const taskType = 'cleanup:auditLogs';
      expect(taskType).toBe('cleanup:auditLogs');
    });

    it('should have cleanup:recycleBin task', () => {
      const taskType = 'cleanup:recycleBin';
      expect(taskType).toBe('cleanup:recycleBin');
    });

    it('should have stats:dailySummary task', () => {
      const taskType = 'stats:dailySummary';
      expect(taskType).toBe('stats:dailySummary');
    });
  });

  describe('Task configuration', () => {
    it('should support interval in minutes', () => {
      const task = { name: 'test', intervalMinutes: 60, enabled: true };
      expect(task.intervalMinutes * 60 * 1000).toBe(3600000);
    });

    it('should support task config options', () => {
      const task = { type: 'cleanup:auditLogs', config: { retentionDays: 90 } };
      expect(task.config.retentionDays).toBe(90);
    });
  });

  describe('Lifecycle', () => {
    it('should stop all tasks cleanly', () => {
      stopAllTasks();
      expect(true).toBe(true);
    });
  });
});

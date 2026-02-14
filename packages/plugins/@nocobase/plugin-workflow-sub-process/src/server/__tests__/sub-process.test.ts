/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Workflow Sub-Process Plugin', () => {
  describe('SubProcessConfig', () => {
    it('should have valid sync mode config', () => {
      const config = {
        workflowKey: 'wf-abc',
        mode: 'sync' as const,
        inputMapping: { orderId: '{{$context.data.id}}' },
        outputMapping: { result: 'output.status' },
        timeout: 300,
      };
      expect(config.mode).toBe('sync');
      expect(config.inputMapping).toHaveProperty('orderId');
      expect(config.timeout).toBe(300);
    });

    it('should have valid async mode config', () => {
      const config = {
        workflowKey: 'wf-xyz',
        mode: 'async' as const,
        inputMapping: { userId: '{{$context.user.id}}' },
      };
      expect(config.mode).toBe('async');
      expect(config.inputMapping).toHaveProperty('userId');
    });
  });

  describe('Output Mapping', () => {
    const getNestedValue = (obj: any, path: string): any =>
      path.split('.').reduce((current, key) => current?.[key], obj);

    const mapOutput = (childResult: any, outputMapping: Record<string, string>) => {
      const result: Record<string, any> = {};
      for (const [parentKey, childPath] of Object.entries(outputMapping)) {
        result[parentKey] = getNestedValue(childResult, childPath);
      }
      return result;
    };

    it('should map simple paths', () => {
      const childResult = { status: 'completed', total: 100 };
      const mapping = { childStatus: 'status', childTotal: 'total' };
      const result = mapOutput(childResult, mapping);
      expect(result.childStatus).toBe('completed');
      expect(result.childTotal).toBe(100);
    });

    it('should map nested paths', () => {
      const childResult = { order: { status: 'shipped', items: [1, 2, 3] } };
      const mapping = { orderStatus: 'order.status', orderItems: 'order.items' };
      const result = mapOutput(childResult, mapping);
      expect(result.orderStatus).toBe('shipped');
      expect(result.orderItems).toEqual([1, 2, 3]);
    });

    it('should return undefined for missing paths', () => {
      const childResult = { a: 1 };
      const mapping = { missing: 'b.c.d' };
      const result = mapOutput(childResult, mapping);
      expect(result.missing).toBeUndefined();
    });
  });
});

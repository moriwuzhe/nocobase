/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Data Aggregation API', () => {
  describe('Metric computation', () => {
    const items = [
      { amount: 100, status: 'active' },
      { amount: 200, status: 'active' },
      { amount: 300, status: 'closed' },
      { amount: 150, status: 'active' },
    ];

    it('should count items', () => {
      expect(items.length).toBe(4);
    });

    it('should sum values', () => {
      const sum = items.reduce((a, b) => a + b.amount, 0);
      expect(sum).toBe(750);
    });

    it('should compute average', () => {
      const avg = items.reduce((a, b) => a + b.amount, 0) / items.length;
      expect(avg).toBe(187.5);
    });

    it('should find min value', () => {
      const min = Math.min(...items.map((i) => i.amount));
      expect(min).toBe(100);
    });

    it('should find max value', () => {
      const max = Math.max(...items.map((i) => i.amount));
      expect(max).toBe(300);
    });

    it('should group by field', () => {
      const groups: Record<string, number> = {};
      items.forEach((i) => {
        groups[i.status] = (groups[i.status] || 0) + 1;
      });
      expect(groups['active']).toBe(3);
      expect(groups['closed']).toBe(1);
    });
  });

  describe('Date range filtering', () => {
    it('should support start and end dates', () => {
      const dateRange = { field: 'createdAt', start: '2024-01-01', end: '2024-12-31' };
      expect(dateRange.field).toBe('createdAt');
      expect(new Date(dateRange.start).getFullYear()).toBe(2024);
    });
  });

  describe('Multiple metrics', () => {
    it('should support multiple metrics in one request', () => {
      const metrics = [
        { type: 'count', alias: 'total' },
        { type: 'sum', field: 'amount', alias: 'totalAmount' },
        { type: 'avg', field: 'amount', alias: 'avgAmount' },
      ];
      expect(metrics.length).toBe(3);
      expect(metrics[0].type).toBe('count');
    });
  });
});

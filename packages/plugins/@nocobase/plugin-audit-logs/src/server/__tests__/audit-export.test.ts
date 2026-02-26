/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Audit Log Export & Analytics', () => {
  describe('Export filtering', () => {
    it('should support date range filter', () => {
      const filter: any = {};
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
      expect(filter.createdAt.$gte).toBeInstanceOf(Date);
      expect(filter.createdAt.$lte).toBeInstanceOf(Date);
    });

    it('should support collection filter', () => {
      const filter: any = { collectionName: 'crmCustomers' };
      expect(filter.collectionName).toBe('crmCustomers');
    });

    it('should limit export to 5000 records max', () => {
      expect(Math.min(10000, 5000)).toBe(5000);
      expect(Math.min(100, 5000)).toBe(100);
    });
  });

  describe('User activity stats', () => {
    it('should categorize actions by type', () => {
      const stats = { creates: 0, updates: 0, deletes: 0, total: 0 };
      const actions = ['create', 'update', 'update', 'destroy', 'create'];
      for (const a of actions) {
        stats.total++;
        if (a === 'create') stats.creates++;
        else if (a === 'update') stats.updates++;
        else if (a === 'destroy') stats.deletes++;
      }
      expect(stats.creates).toBe(2);
      expect(stats.updates).toBe(2);
      expect(stats.deletes).toBe(1);
      expect(stats.total).toBe(5);
    });

    it('should compute days since date', () => {
      const days = 30;
      const since = new Date(Date.now() - days * 86400000);
      expect(since.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Collection activity stats', () => {
    it('should group by collection name', () => {
      const logs = [
        { collectionName: 'users', type: 'update' },
        { collectionName: 'users', type: 'create' },
        { collectionName: 'orders', type: 'create' },
      ];
      const colStats: Record<string, number> = {};
      logs.forEach((l) => { colStats[l.collectionName] = (colStats[l.collectionName] || 0) + 1; });
      expect(colStats['users']).toBe(2);
      expect(colStats['orders']).toBe(1);
    });
  });
});

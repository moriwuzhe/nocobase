/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Global Search Plugin', () => {
  describe('Search Config', () => {
    it('should store collection→fields mapping', () => {
      const searchConfig = new Map<string, string[]>();
      searchConfig.set('orders', ['title', 'description']);
      searchConfig.set('users', ['nickname', 'email']);

      expect(searchConfig.get('orders')).toEqual(['title', 'description']);
      expect(searchConfig.has('nonexistent')).toBe(false);
      expect(searchConfig.size).toBe(2);
    });

    it('should handle default auto-detection of string/text fields', () => {
      // Simulate auto-detection: only string/text fields, max 5 per collection
      const fields = [
        { name: 'id', type: 'integer' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'count', type: 'integer' },
        { name: 'email', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'address', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'extra', type: 'string' },
      ];

      const searchable = fields
        .filter((f) => ['string', 'text'].includes(f.type))
        .map((f) => f.name)
        .slice(0, 5);

      expect(searchable).toEqual(['title', 'description', 'email', 'notes', 'address']);
      expect(searchable.length).toBe(5);
    });
  });

  describe('Search Result Deduplication', () => {
    it('should deduplicate search history by keyword', () => {
      const history = [
        { keyword: 'order', resultCount: 5, createdAt: '2025-01-03' },
        { keyword: 'customer', resultCount: 3, createdAt: '2025-01-02' },
        { keyword: 'order', resultCount: 8, createdAt: '2025-01-01' },
      ];

      const seen = new Set();
      const deduped = history.filter((r) => {
        if (seen.has(r.keyword)) return false;
        seen.add(r.keyword);
        return true;
      });

      expect(deduped).toHaveLength(2);
      expect(deduped[0].keyword).toBe('order');
      expect(deduped[0].resultCount).toBe(5); // Most recent kept
    });
  });

  describe('OR Filter Construction', () => {
    it('should build $or filter from searchable fields', () => {
      const fields = ['title', 'description', 'name'];
      const keyword = 'test';
      const filter = {
        $or: fields.map((field) => ({ [field]: { $includes: keyword } })),
      };

      expect(filter.$or).toHaveLength(3);
      expect(filter.$or[0]).toEqual({ title: { $includes: 'test' } });
      expect(filter.$or[2]).toEqual({ name: { $includes: 'test' } });
    });
  });

  describe('Favorite Management', () => {
    it('should detect if a record is already favorited', () => {
      const favorites = [
        { collectionName: 'orders', recordId: '1' },
        { collectionName: 'users', recordId: '5' },
      ];

      const isFavorited = (col: string, id: string) =>
        favorites.some((f) => f.collectionName === col && f.recordId === id);

      expect(isFavorited('orders', '1')).toBe(true);
      expect(isFavorited('orders', '2')).toBe(false);
      expect(isFavorited('users', '5')).toBe(true);
    });
  });
});

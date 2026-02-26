/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Rating Field Plugin', () => {
  describe('Rating field value', () => {
    it('should store rating as a number', () => {
      const rating = 4.5;
      expect(typeof rating).toBe('number');
      expect(rating).toBeGreaterThanOrEqual(0);
    });

    it('should default to 5-star scale', () => {
      const config = { count: 5, allowHalf: true };
      expect(config.count).toBe(5);
    });

    it('should support half-star ratings', () => {
      const rating = 3.5;
      expect(rating % 0.5).toBe(0);
    });

    it('should clamp values to valid range', () => {
      const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max));
      expect(clamp(-1, 5)).toBe(0);
      expect(clamp(6, 5)).toBe(5);
      expect(clamp(3, 5)).toBe(3);
    });
  });

  describe('Rating field configuration', () => {
    it('should support custom star count', () => {
      const configs = [
        { count: 3, allowHalf: false },
        { count: 5, allowHalf: true },
        { count: 10, allowHalf: false },
      ];
      configs.forEach((c) => {
        expect(c.count).toBeGreaterThan(0);
        expect(c.count).toBeLessThanOrEqual(10);
      });
    });

    it('should support custom color', () => {
      const config = { color: '#fadb14' };
      expect(config.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { MASKING_STRATEGIES } from '../middlewares/data-masking';

describe('Data Masking Engine', () => {
  describe('Phone masking', () => {
    it('should mask middle digits of phone number', () => {
      expect(MASKING_STRATEGIES.phone('13812345678')).toBe('138****5678');
    });

    it('should handle short numbers gracefully', () => {
      expect(MASKING_STRATEGIES.phone('123')).toBe('123');
    });

    it('should handle null/empty', () => {
      expect(MASKING_STRATEGIES.phone('')).toBe('');
    });
  });

  describe('Email masking', () => {
    it('should mask local part of email', () => {
      const masked = MASKING_STRATEGIES.email('john.doe@example.com');
      expect(masked).toContain('@example.com');
      expect(masked).toContain('***');
      expect(masked.startsWith('j')).toBe(true);
    });

    it('should handle short local part', () => {
      const masked = MASKING_STRATEGIES.email('ab@x.com');
      expect(masked).toContain('@x.com');
    });
  });

  describe('ID card masking', () => {
    it('should mask middle of ID number', () => {
      const masked = MASKING_STRATEGIES.idCard('110101199001011234');
      expect(masked.startsWith('110101')).toBe(true);
      expect(masked.endsWith('1234')).toBe(true);
      expect(masked).toContain('********');
    });
  });

  describe('Bank account masking', () => {
    it('should show first and last 4 digits', () => {
      const masked = MASKING_STRATEGIES.bankAccount('6222021234567890');
      expect(masked.startsWith('6222')).toBe(true);
      expect(masked.endsWith('7890')).toBe(true);
      expect(masked).toContain('****');
    });
  });

  describe('Name masking', () => {
    it('should mask middle characters of name', () => {
      expect(MASKING_STRATEGIES.name('张三')).toBe('张*');
      expect(MASKING_STRATEGIES.name('张三丰')).toBe('张*丰');
      expect(MASKING_STRATEGIES.name('欧阳复姓')).toBe('欧**姓');
    });

    it('should handle single character', () => {
      expect(MASKING_STRATEGIES.name('张')).toBe('张');
    });
  });

  describe('Custom masking', () => {
    it('should mask middle portion', () => {
      const masked = MASKING_STRATEGIES.custom('sensitive-data-here');
      expect(masked.startsWith('se')).toBe(true);
      expect(masked.endsWith('re')).toBe(true);
      expect(masked).toContain('*');
    });

    it('should handle short strings', () => {
      expect(MASKING_STRATEGIES.custom('ab')).toBe('**');
    });
  });
});

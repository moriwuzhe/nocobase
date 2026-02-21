/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { TEMPLATE_CATALOG } from '../Plugin';

describe('Template Market Plugin', () => {
  describe('Template catalog', () => {
    it('should have 17 templates', () => {
      expect(TEMPLATE_CATALOG.length).toBe(17);
    });

    it('should have unique template names', () => {
      const names = TEMPLATE_CATALOG.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have unique plugin names', () => {
      const pluginNames = TEMPLATE_CATALOG.map((t) => t.pluginName);
      expect(new Set(pluginNames).size).toBe(pluginNames.length);
    });

    it('every template should have required fields', () => {
      TEMPLATE_CATALOG.forEach((t) => {
        expect(t.name).toBeTruthy();
        expect(t.pluginName).toBeTruthy();
        expect(t.title).toBeTruthy();
        expect(t.titleZh).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.descriptionZh).toBeTruthy();
        expect(t.icon).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.collections.length).toBeGreaterThan(0);
        expect(t.tags.length).toBeGreaterThan(0);
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['sales', 'supply', 'finance', 'hr', 'office', 'service', 'assets', 'community'];
      TEMPLATE_CATALOG.forEach((t) => {
        expect(validCategories).toContain(t.category);
      });
    });

    it('should cover all categories', () => {
      const categories = new Set(TEMPLATE_CATALOG.map((t) => t.category));
      expect(categories.size).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Template filtering', () => {
    it('should filter by category', () => {
      const salesTemplates = TEMPLATE_CATALOG.filter((t) => t.category === 'sales');
      expect(salesTemplates.length).toBeGreaterThanOrEqual(2);
    });

    it('should search by keyword', () => {
      const search = (keyword: string) =>
        TEMPLATE_CATALOG.filter(
          (t) =>
            t.title.toLowerCase().includes(keyword.toLowerCase()) ||
            t.titleZh.includes(keyword) ||
            t.tags.some((tag) => tag.includes(keyword)),
        );
      expect(search('crm').length).toBeGreaterThan(0);
      expect(search('hr').length).toBeGreaterThan(0);
      expect(search('客户').length).toBeGreaterThan(0);
    });
  });
});

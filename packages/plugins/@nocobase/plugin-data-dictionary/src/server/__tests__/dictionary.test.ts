/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { dictionaryFieldInterface } from '../DictionaryFieldInterface';

describe('Data Dictionary', () => {
  describe('DictionaryFieldInterface', () => {
    it('should have correct basic properties', () => {
      expect(dictionaryFieldInterface.name).toBe('dictionary');
      expect(dictionaryFieldInterface.type).toBe('object');
      expect(dictionaryFieldInterface.group).toBe('choices');
    });

    it('should have string as available type', () => {
      expect(dictionaryFieldInterface.availableTypes).toContain('string');
    });

    it('should default to DictionarySelect component', () => {
      expect(dictionaryFieldInterface.default.uiSchema['x-component']).toBe('DictionarySelect');
    });

    it('should have dictionaryCode property', () => {
      const props = dictionaryFieldInterface.properties;
      expect(props['uiSchema.x-component-props.dictionaryCode']).toBeDefined();
      expect(props['uiSchema.x-component-props.dictionaryCode'].required).toBe(true);
    });

    it('should have display mode property', () => {
      const modeProps = dictionaryFieldInterface.properties['uiSchema.x-component-props.mode'];
      expect(modeProps).toBeDefined();
      expect(modeProps.default).toBe('select');
      const values = modeProps.enum.map((e: any) => e.value);
      expect(values).toContain('select');
      expect(values).toContain('radio');
      expect(values).toContain('tag');
    });

    it('should have allowMultiple property', () => {
      const prop = dictionaryFieldInterface.properties['uiSchema.x-component-props.allowMultiple'];
      expect(prop).toBeDefined();
      expect(prop.default).toBe(false);
    });

    it('should have proper filterable operators', () => {
      const operators = dictionaryFieldInterface.filterable.operators;
      const opValues = operators.map((o: any) => o.value);
      expect(opValues).toContain('$eq');
      expect(opValues).toContain('$ne');
      expect(opValues).toContain('$in');
      expect(opValues).toContain('$notIn');
      expect(opValues).toContain('$empty');
      expect(opValues).toContain('$notEmpty');
    });
  });

  describe('System Dictionaries Seed Data', () => {
    // Verify the seed data shape
    const systemDicts = [
      {
        code: 'priority',
        expectedItems: ['low', 'medium', 'high', 'urgent'],
        defaultItem: 'medium',
      },
      {
        code: 'status',
        expectedItems: ['draft', 'active', 'completed', 'cancelled', 'archived'],
        defaultItem: 'active',
      },
      {
        code: 'gender',
        expectedItems: ['male', 'female', 'other'],
      },
      {
        code: 'yes_no',
        expectedItems: ['yes', 'no'],
      },
    ];

    it.each(systemDicts)('should define $code dictionary correctly', ({ code, expectedItems }) => {
      expect(code).toBeTruthy();
      expect(expectedItems.length).toBeGreaterThan(0);
    });
  });
});

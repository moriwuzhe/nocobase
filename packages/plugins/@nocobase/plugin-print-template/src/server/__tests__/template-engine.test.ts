/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import PluginPrintTemplateServer from '../Plugin';

/**
 * Test the template engine methods directly (they are private,
 * so we test them through the class by making a test subclass).
 */
class TestableTemplateEngine extends PluginPrintTemplateServer {
  // Expose private methods for testing
  public testInterpolate(html: string, data: any, context: any) {
    return (this as any).interpolate(html, data, context);
  }
  public testProcessLoops(html: string, data: any) {
    return (this as any).processLoops(html, data);
  }
  public testProcessConditionals(html: string, data: any) {
    return (this as any).processConditionals(html, data);
  }

  // Override Plugin constructor requirements
  constructor() {
    // @ts-ignore - skip Plugin constructor for unit testing
    super({} as any);
  }
  async load() {}
}

describe('Print Template Engine', () => {
  let engine: TestableTemplateEngine;

  beforeAll(() => {
    engine = new TestableTemplateEngine();
  });

  describe('interpolate', () => {
    const context = {
      currentUser: { id: 1, nickname: 'Admin', email: 'admin@test.com' },
      now: new Date('2025-01-15T10:30:00Z'),
    };

    it('should replace simple field variables', () => {
      const result = engine.testInterpolate('Hello {{name}}!', { name: 'World' }, context);
      expect(result).toBe('Hello World!');
    });

    it('should replace nested field variables', () => {
      const data = { customer: { name: 'Acme', address: { city: 'Shanghai' } } };
      const result = engine.testInterpolate('{{customer.name}} in {{customer.address.city}}', data, context);
      expect(result).toBe('Acme in Shanghai');
    });

    it('should replace system variables', () => {
      const result = engine.testInterpolate('Date: {{currentDate}}, User: {{currentUser.nickname}}', {}, context);
      expect(result).toContain('User: Admin');
      expect(result).toContain('Date:');
    });

    it('should handle missing fields gracefully', () => {
      const result = engine.testInterpolate('{{missing}} and {{deeply.nested.missing}}', {}, context);
      expect(result).toBe(' and ');
    });

    it('should convert booleans to Yes/No', () => {
      const result = engine.testInterpolate('Active: {{active}}', { active: true }, context);
      expect(result).toBe('Active: Yes');
    });

    it('should handle null and undefined', () => {
      const result = engine.testInterpolate('{{a}} {{b}}', { a: null, b: undefined }, context);
      expect(result).toBe(' ');
    });

    it('should insert page break for {{pageBreak}}', () => {
      const result = engine.testInterpolate('before{{pageBreak}}after', {}, context);
      expect(result).toContain('page-break-after: always');
    });

    it('should stringify objects', () => {
      const result = engine.testInterpolate('{{obj}}', { obj: { a: 1 } }, context);
      expect(result).toBe('{"a":1}');
    });
  });

  describe('processLoops', () => {
    it('should render loop for array field', () => {
      const html = '<ul>{{#each items}}<li>{{name}} - {{price}}</li>{{/each}}</ul>';
      const data = {
        items: [
          { name: 'Apple', price: 3 },
          { name: 'Banana', price: 2 },
        ],
      };
      const result = engine.testProcessLoops(html, data);
      expect(result).toContain('<li>Apple - 3</li>');
      expect(result).toContain('<li>Banana - 2</li>');
    });

    it('should support @index', () => {
      const html = '{{#each items}}{{@index}}.{{name}} {{/each}}';
      const data = { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
      const result = engine.testProcessLoops(html, data);
      expect(result).toBe('1.A 2.B 3.C ');
    });

    it('should return empty string for non-array field', () => {
      const html = '{{#each missing}}<li>{{name}}</li>{{/each}}';
      const result = engine.testProcessLoops(html, {});
      expect(result).toBe('');
    });

    it('should handle empty array', () => {
      const html = '{{#each items}}<li>{{name}}</li>{{/each}}';
      const result = engine.testProcessLoops(html, { items: [] });
      expect(result).toBe('');
    });

    it('should handle nested path in each', () => {
      const html = '{{#each order.items}}<li>{{name}}</li>{{/each}}';
      const data = { order: { items: [{ name: 'Item 1' }] } };
      const result = engine.testProcessLoops(html, data);
      expect(result).toContain('<li>Item 1</li>');
    });
  });

  describe('processConditionals', () => {
    it('should show truthy block', () => {
      const html = '{{#if active}}Active{{/if}}';
      const result = engine.testProcessConditionals(html, { active: true });
      expect(result).toBe('Active');
    });

    it('should hide falsy block', () => {
      const html = '{{#if active}}Active{{/if}}';
      const result = engine.testProcessConditionals(html, { active: false });
      expect(result).toBe('');
    });

    it('should support else block', () => {
      const html = '{{#if active}}Active{{else}}Inactive{{/if}}';
      expect(engine.testProcessConditionals(html, { active: true })).toBe('Active');
      expect(engine.testProcessConditionals(html, { active: false })).toBe('Inactive');
    });

    it('should handle missing field as falsy', () => {
      const html = '{{#if missing}}Yes{{else}}No{{/if}}';
      expect(engine.testProcessConditionals(html, {})).toBe('No');
    });

    it('should handle nested path in condition', () => {
      const html = '{{#if user.premium}}Premium{{else}}Free{{/if}}';
      expect(engine.testProcessConditionals(html, { user: { premium: true } })).toBe('Premium');
      expect(engine.testProcessConditionals(html, { user: { premium: false } })).toBe('Free');
    });

    it('should treat non-empty string as truthy', () => {
      const html = '{{#if name}}Has name{{/if}}';
      expect(engine.testProcessConditionals(html, { name: 'John' })).toBe('Has name');
    });

    it('should treat 0 as falsy', () => {
      const html = '{{#if count}}Has items{{else}}Empty{{/if}}';
      expect(engine.testProcessConditionals(html, { count: 0 })).toBe('Empty');
    });
  });
});

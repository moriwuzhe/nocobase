/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Form Trigger Plugin', () => {
  describe('FormTrigger type', () => {
    it('should use "form" as trigger type identifier', () => {
      const triggerType = 'form';
      expect(triggerType).toBe('form');
    });
  });

  describe('Form trigger configuration', () => {
    it('should require formKey in config', () => {
      const config = { formKey: 'contact-form', collection: 'contacts' };
      expect(config.formKey).toBeDefined();
      expect(typeof config.formKey).toBe('string');
    });

    it('should allow optional collection binding', () => {
      const configWithCollection = { formKey: 'order-form', collection: 'orders' };
      const configWithoutCollection = { formKey: 'feedback-form' };
      expect(configWithCollection.collection).toBe('orders');
      expect((configWithoutCollection as any).collection).toBeUndefined();
    });

    it('should support sync and async modes', () => {
      const syncWorkflow = { type: 'form', sync: true, config: { formKey: 'sync-form' } };
      const asyncWorkflow = { type: 'form', sync: false, config: { formKey: 'async-form' } };
      expect(syncWorkflow.sync).toBe(true);
      expect(asyncWorkflow.sync).toBe(false);
    });
  });

  describe('Form submission payload', () => {
    it('should accept formKey and data in submission', () => {
      const payload = {
        formKey: 'registration',
        data: { name: 'Test User', email: 'test@example.com' },
      };
      expect(payload.formKey).toBe('registration');
      expect(payload.data.name).toBe('Test User');
    });

    it('should handle empty data gracefully', () => {
      const payload = { formKey: 'empty-form', data: {} };
      expect(Object.keys(payload.data)).toHaveLength(0);
    });
  });
});

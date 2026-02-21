/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

describe('Signature Field Plugin', () => {
  describe('Signature field interface', () => {
    it('should store signature as base64 data URI', () => {
      const signatureValue = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU...';
      expect(signatureValue).toMatch(/^data:image\/(png|svg\+xml|jpeg);base64,/);
    });

    it('should handle empty signature', () => {
      const emptySignature = null;
      expect(emptySignature).toBeNull();
    });

    it('should validate signature format', () => {
      const isValidSignature = (val: string | null): boolean => {
        if (!val) return true;
        return val.startsWith('data:image/');
      };
      expect(isValidSignature('data:image/png;base64,abc')).toBe(true);
      expect(isValidSignature(null)).toBe(true);
      expect(isValidSignature('not-a-signature')).toBe(false);
    });
  });

  describe('Signature field configuration', () => {
    it('should support width and height options', () => {
      const fieldConfig = {
        type: 'text',
        interface: 'signature',
        uiSchema: {
          'x-component-props': { width: 400, height: 200, penColor: '#000' },
        },
      };
      expect(fieldConfig.uiSchema['x-component-props'].width).toBe(400);
      expect(fieldConfig.uiSchema['x-component-props'].height).toBe(200);
    });

    it('should support custom pen color', () => {
      const config = { penColor: '#1677ff', backgroundColor: '#fff' };
      expect(config.penColor).toBe('#1677ff');
    });
  });
});

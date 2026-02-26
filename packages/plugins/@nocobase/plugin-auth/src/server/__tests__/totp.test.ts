/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { generateSecret, generateTOTP, verifyTOTP, generateTOTPUri, generateBackupCodes } from '../totp-service';

describe('TOTP Two-Factor Authentication', () => {
  describe('Secret generation', () => {
    it('should generate a base32 encoded secret', () => {
      const secret = generateSecret();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(10);
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it('should generate unique secrets', () => {
      const s1 = generateSecret();
      const s2 = generateSecret();
      expect(s1).not.toBe(s2);
    });
  });

  describe('TOTP generation and verification', () => {
    it('should generate a 6-digit code', () => {
      const secret = generateSecret();
      const code = generateTOTP(secret);
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should verify a valid TOTP code', () => {
      const secret = generateSecret();
      const code = generateTOTP(secret);
      expect(verifyTOTP(secret, code)).toBe(true);
    });

    it('should reject an invalid TOTP code', () => {
      const secret = generateSecret();
      expect(verifyTOTP(secret, '000000')).toBe(false);
      expect(verifyTOTP(secret, 'abcdef')).toBe(false);
      expect(verifyTOTP(secret, '')).toBe(false);
    });

    it('should accept codes within time window', () => {
      const secret = generateSecret();
      const now = Math.floor(Date.now() / 1000);
      const code = generateTOTP(secret, now);
      expect(verifyTOTP(secret, code, 1)).toBe(true);
    });
  });

  describe('TOTP URI generation', () => {
    it('should generate a valid otpauth URI', () => {
      const secret = generateSecret();
      const uri = generateTOTPUri(secret, 'user@example.com', 'MyApp');
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain('secret=' + secret);
      expect(uri).toContain('issuer=MyApp');
    });

    it('should URL-encode special characters', () => {
      const secret = generateSecret();
      const uri = generateTOTPUri(secret, 'user@example.com', 'My App');
      expect(uri).toContain('My%20App');
    });
  });

  describe('Backup codes', () => {
    it('should generate 8 backup codes by default', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(8);
    });

    it('should generate codes in XXXX-XXXX format', () => {
      const codes = generateBackupCodes();
      codes.forEach((code) => {
        expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
      });
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes(8);
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });

    it('should support custom count', () => {
      expect(generateBackupCodes(4)).toHaveLength(4);
      expect(generateBackupCodes(12)).toHaveLength(12);
    });
  });
});

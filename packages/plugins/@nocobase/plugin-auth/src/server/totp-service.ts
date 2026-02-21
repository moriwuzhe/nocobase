/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * TOTP (Time-based One-Time Password) Service
 *
 * Implements RFC 6238 TOTP for two-factor authentication.
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 *
 * Flow:
 * 1. User enables 2FA: server generates secret, returns QR code URI
 * 2. User scans QR code with authenticator app
 * 3. User verifies with a TOTP code to confirm setup
 * 4. On login, after password verification, user must provide TOTP code
 */

import * as crypto from 'crypto';

const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'sha1';
const TOTP_WINDOW = 1;

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = encoded.replace(/[= ]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = alphabet.indexOf(cleanInput[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function generateHOTP(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = counter & 0xff;
    counter = counter >>> 8;
  }

  const hmac = crypto.createHmac(TOTP_ALGORITHM, secret);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(code % Math.pow(10, TOTP_DIGITS)).padStart(TOTP_DIGITS, '0');
}

export function generateSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

export function generateTOTP(secret: string, time?: number): string {
  const counter = Math.floor((time || Date.now() / 1000) / TOTP_PERIOD);
  const secretBuffer = base32Decode(secret);
  return generateHOTP(secretBuffer, counter);
}

export function verifyTOTP(secret: string, token: string, window: number = TOTP_WINDOW): boolean {
  if (!token || token.length !== TOTP_DIGITS) return false;

  const now = Math.floor(Date.now() / 1000);
  const secretBuffer = base32Decode(secret);

  for (let i = -window; i <= window; i++) {
    const counter = Math.floor(now / TOTP_PERIOD) + i;
    const expected = generateHOTP(secretBuffer, counter);
    if (expected === token) return true;
  }

  return false;
}

export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer: string = 'NocoBase',
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM.toUpperCase()}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

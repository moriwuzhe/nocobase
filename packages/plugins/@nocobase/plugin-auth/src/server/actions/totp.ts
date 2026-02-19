/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, Next } from '@nocobase/actions';
import {
  generateSecret,
  verifyTOTP,
  generateTOTPUri,
  generateBackupCodes,
} from '../totp-service';

/**
 * POST /api/auth:setupTOTP
 * Generates a new TOTP secret and returns the QR code URI.
 * Does NOT enable 2FA yet — user must verify first.
 */
export async function setupTOTP(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const secret = generateSecret();
  const email = ctx.state.currentUser?.email || `user-${userId}`;

  const systemSettings = await ctx.db.getRepository('systemSettings').findOne({ filterByTk: 1 });
  const appTitle = systemSettings?.title || 'NocoBase';

  const uri = generateTOTPUri(secret, email, appTitle);
  const backupCodes = generateBackupCodes(8);

  await ctx.db.getRepository('users').update({
    filterByTk: userId,
    values: {
      totpSecret: secret,
      totpBackupCodes: backupCodes,
      totpEnabled: false,
    },
  });

  ctx.body = {
    secret,
    uri,
    backupCodes,
    message: 'Scan the QR code with your authenticator app, then verify with a code.',
  };
  await next();
}

/**
 * POST /api/auth:verifyTOTPSetup
 * Body: { code }
 * Verifies the TOTP code and enables 2FA for the user.
 */
export async function verifyTOTPSetup(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const { code } = ctx.action.params.values || {};
  if (!code) return ctx.throw(400, 'Verification code is required');

  const user = await ctx.db.getRepository('users').findOne({ filterByTk: userId });
  if (!user?.totpSecret) {
    return ctx.throw(400, 'Please call setupTOTP first');
  }

  if (!verifyTOTP(user.totpSecret, code)) {
    return ctx.throw(400, 'Invalid verification code. Please try again.');
  }

  await ctx.db.getRepository('users').update({
    filterByTk: userId,
    values: { totpEnabled: true },
  });

  ctx.body = {
    success: true,
    message: 'Two-factor authentication has been enabled successfully.',
  };
  await next();
}

/**
 * POST /api/auth:disableTOTP
 * Body: { code }
 * Disables 2FA for the current user (requires valid TOTP code).
 */
export async function disableTOTP(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const { code } = ctx.action.params.values || {};
  if (!code) return ctx.throw(400, 'Verification code is required');

  const user = await ctx.db.getRepository('users').findOne({ filterByTk: userId });
  if (!user?.totpEnabled) {
    return ctx.throw(400, '2FA is not enabled');
  }

  if (!verifyTOTP(user.totpSecret, code)) {
    const backupCodes: string[] = user.totpBackupCodes || [];
    const codeIdx = backupCodes.indexOf(code);
    if (codeIdx === -1) {
      return ctx.throw(400, 'Invalid code');
    }
    backupCodes.splice(codeIdx, 1);
    await ctx.db.getRepository('users').update({
      filterByTk: userId,
      values: { totpBackupCodes: backupCodes },
    });
  }

  await ctx.db.getRepository('users').update({
    filterByTk: userId,
    values: {
      totpEnabled: false,
      totpSecret: null,
      totpBackupCodes: null,
    },
  });

  ctx.body = {
    success: true,
    message: 'Two-factor authentication has been disabled.',
  };
  await next();
}

/**
 * POST /api/auth:verifyTOTP
 * Body: { code, token }
 * Verifies TOTP code during login flow.
 * Called after initial password authentication.
 */
export async function verifyTOTPLogin(ctx: Context, next: Next) {
  const { code, userId } = ctx.action.params.values || {};
  if (!code || !userId) return ctx.throw(400, 'code and userId are required');

  const user = await ctx.db.getRepository('users').findOne({ filterByTk: userId });
  if (!user?.totpEnabled || !user?.totpSecret) {
    ctx.body = { success: true, skip: true };
    return next();
  }

  if (verifyTOTP(user.totpSecret, code)) {
    ctx.body = { success: true };
    return next();
  }

  const backupCodes: string[] = user.totpBackupCodes || [];
  const codeIdx = backupCodes.indexOf(code);
  if (codeIdx !== -1) {
    backupCodes.splice(codeIdx, 1);
    await ctx.db.getRepository('users').update({
      filterByTk: userId,
      values: { totpBackupCodes: backupCodes },
    });
    ctx.body = { success: true, usedBackupCode: true };
    return next();
  }

  return ctx.throw(400, 'Invalid verification code');
}

/**
 * GET /api/auth:getTOTPStatus
 * Returns the current 2FA status for the logged-in user.
 */
export async function getTOTPStatus(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const user = await ctx.db.getRepository('users').findOne({
    filterByTk: userId,
    fields: ['totpEnabled', 'totpBackupCodes'],
  });

  ctx.body = {
    enabled: !!user?.totpEnabled,
    backupCodesRemaining: (user?.totpBackupCodes || []).length,
  };
  await next();
}

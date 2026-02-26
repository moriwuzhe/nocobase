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

const TOTP_REPO = 'userTotpSettings';

async function getTotpSettings(ctx: Context, userId: number) {
  const repo = ctx.db.getRepository(TOTP_REPO);
  if (!repo) return null;
  return repo.findOne({ filter: { userId } });
}

async function upsertTotpSettings(ctx: Context, userId: number, values: Record<string, any>) {
  const repo = ctx.db.getRepository(TOTP_REPO);
  if (!repo) return;
  const existing = await repo.findOne({ filter: { userId } });
  if (existing) {
    await repo.update({ filter: { userId }, values });
  } else {
    await repo.create({ values: { userId, ...values } });
  }
}

/**
 * POST /api/auth:setupTOTP
 */
export async function setupTOTP(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const secret = generateSecret();
  const email = ctx.state.currentUser?.email || `user-${userId}`;

  let appTitle = 'NocoBase';
  try {
    const systemSettings = await ctx.db.getRepository('systemSettings').findOne({ filterByTk: 1 });
    appTitle = systemSettings?.title || 'NocoBase';
  } catch { /* ignore */ }

  const uri = generateTOTPUri(secret, email, appTitle);
  const backupCodes = generateBackupCodes(8);

  await upsertTotpSettings(ctx, userId, {
    totpSecret: secret,
    totpBackupCodes: backupCodes,
    totpEnabled: false,
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
 */
export async function verifyTOTPSetup(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const { code } = ctx.action.params.values || {};
  if (!code) return ctx.throw(400, 'Verification code is required');

  const settings = await getTotpSettings(ctx, userId);
  if (!settings?.totpSecret) {
    return ctx.throw(400, 'Please call setupTOTP first');
  }

  if (!verifyTOTP(settings.totpSecret, code)) {
    return ctx.throw(400, 'Invalid verification code. Please try again.');
  }

  await upsertTotpSettings(ctx, userId, { totpEnabled: true });

  ctx.body = {
    success: true,
    message: 'Two-factor authentication has been enabled successfully.',
  };
  await next();
}

/**
 * POST /api/auth:disableTOTP
 * Body: { code }
 */
export async function disableTOTP(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const { code } = ctx.action.params.values || {};
  if (!code) return ctx.throw(400, 'Verification code is required');

  const settings = await getTotpSettings(ctx, userId);
  if (!settings?.totpEnabled) {
    return ctx.throw(400, '2FA is not enabled');
  }

  if (!verifyTOTP(settings.totpSecret, code)) {
    const backupCodes: string[] = settings.totpBackupCodes || [];
    const codeIdx = backupCodes.indexOf(code);
    if (codeIdx === -1) {
      return ctx.throw(400, 'Invalid code');
    }
    backupCodes.splice(codeIdx, 1);
    await upsertTotpSettings(ctx, userId, { totpBackupCodes: backupCodes });
  }

  await upsertTotpSettings(ctx, userId, {
    totpEnabled: false,
    totpSecret: null,
    totpBackupCodes: null,
  });

  ctx.body = {
    success: true,
    message: 'Two-factor authentication has been disabled.',
  };
  await next();
}

/**
 * POST /api/auth:verifyTOTP
 * Body: { code, userId }
 */
export async function verifyTOTPLogin(ctx: Context, next: Next) {
  const { code, userId } = ctx.action.params.values || {};
  if (!code || !userId) return ctx.throw(400, 'code and userId are required');

  const settings = await getTotpSettings(ctx, userId);
  if (!settings?.totpEnabled || !settings?.totpSecret) {
    ctx.body = { success: true, skip: true };
    return next();
  }

  if (verifyTOTP(settings.totpSecret, code)) {
    ctx.body = { success: true };
    return next();
  }

  const backupCodes: string[] = settings.totpBackupCodes || [];
  const codeIdx = backupCodes.indexOf(code);
  if (codeIdx !== -1) {
    backupCodes.splice(codeIdx, 1);
    await upsertTotpSettings(ctx, userId, { totpBackupCodes: backupCodes });
    ctx.body = { success: true, usedBackupCode: true };
    return next();
  }

  return ctx.throw(400, 'Invalid verification code');
}

/**
 * GET /api/auth:getTOTPStatus
 */
export async function getTOTPStatus(ctx: Context, next: Next) {
  const userId = ctx.state.currentUser?.id;
  if (!userId) return ctx.throw(401, 'Not authenticated');

  const settings = await getTotpSettings(ctx, userId);

  ctx.body = {
    enabled: !!settings?.totpEnabled,
    backupCodesRemaining: (settings?.totpBackupCodes || []).length,
  };
  await next();
}

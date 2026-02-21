/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'userTotpSettings',
  title: 'User TOTP Settings',
  createdBy: false,
  updatedBy: false,
  fields: [
    {
      type: 'integer',
      name: 'userId',
      unique: true,
    },
    {
      type: 'string',
      name: 'totpSecret',
    },
    {
      type: 'boolean',
      name: 'totpEnabled',
      defaultValue: false,
    },
    {
      type: 'json',
      name: 'totpBackupCodes',
      defaultValue: [],
    },
  ],
});

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
  sortable: true,
  logging: true,
  name: 'webhookLogs',
  dumpRules: { group: 'log' },
  shared: true,
  fields: [
    { type: 'belongsTo', name: 'webhook', target: 'webhooks', foreignKey: 'webhookId' },
    { type: 'string', name: 'event' },
    { type: 'string', name: 'direction', comment: 'inbound | outbound' },
    { type: 'integer', name: 'statusCode' },
    { type: 'jsonb', name: 'requestHeaders', defaultValue: {} },
    { type: 'jsonb', name: 'requestBody', defaultValue: {} },
    { type: 'jsonb', name: 'responseHeaders', defaultValue: {} },
    { type: 'text', name: 'responseBody' },
    { type: 'integer', name: 'duration', comment: 'Response time in ms' },
    { type: 'string', name: 'status', defaultValue: 'success', comment: 'success | failed | timeout' },
    { type: 'text', name: 'error' },
    { type: 'integer', name: 'retryCount', defaultValue: 0 },
  ],
});

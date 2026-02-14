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
  name: 'webhooks',
  dumpRules: { group: 'required' },
  shared: true,
  fields: [
    { type: 'string', name: 'name' },
    { type: 'string', name: 'type', comment: 'inbound | outbound' },
    { type: 'string', name: 'url', comment: 'For outbound: the target URL. For inbound: auto-generated path.' },
    { type: 'string', name: 'secret', comment: 'Signing secret for verification' },
    { type: 'string', name: 'method', defaultValue: 'POST' },
    { type: 'jsonb', name: 'headers', defaultValue: {} },
    { type: 'jsonb', name: 'events', defaultValue: [], comment: 'For outbound: list of event names to subscribe to' },
    { type: 'string', name: 'collectionName', comment: 'For collection-based events' },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'maxRetries', defaultValue: 3 },
    { type: 'integer', name: 'timeoutMs', defaultValue: 10000 },
    { type: 'hasMany', name: 'logs', target: 'webhookLogs', foreignKey: 'webhookId' },
  ],
});

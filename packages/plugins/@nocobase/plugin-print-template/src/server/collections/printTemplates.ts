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
  name: 'printTemplates',
  dumpRules: { group: 'required' },
  migrationRules: ['overwrite'],
  shared: true,
  fields: [
    {
      type: 'string',
      name: 'name',
      comment: 'Template name',
    },
    {
      type: 'string',
      name: 'collectionName',
      comment: 'The collection this template applies to',
    },
    {
      type: 'text',
      name: 'content',
      comment: 'HTML template content with {{variable}} placeholders',
    },
    {
      type: 'jsonb',
      name: 'appends',
      defaultValue: [],
      comment: 'Relations to load when rendering',
    },
    {
      type: 'string',
      name: 'paperSize',
      defaultValue: 'A4',
      comment: 'A4, A5, Letter, etc.',
    },
    {
      type: 'string',
      name: 'orientation',
      defaultValue: 'portrait',
      comment: 'portrait or landscape',
    },
    {
      type: 'jsonb',
      name: 'margins',
      defaultValue: { top: 20, right: 20, bottom: 20, left: 20 },
      comment: 'Page margins in mm',
    },
    {
      type: 'boolean',
      name: 'showWatermark',
      defaultValue: false,
    },
    {
      type: 'string',
      name: 'watermarkText',
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: true,
    },
  ],
});

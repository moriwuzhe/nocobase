/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';
import { NAMESPACE } from '../../common/constants';

export default defineCollection({
  name: 'comments',
  dumpRules: { group: 'log' },
  migrationRules: ['schema-only'],
  shared: true,
  fields: [
    {
      type: 'snowflakeId',
      name: 'id',
      primaryKey: true,
      allowNull: false,
    },
    // The collection and record this comment belongs to (polymorphic)
    {
      type: 'string',
      name: 'collectionName',
      index: true,
      comment: 'Target collection name',
    },
    {
      type: 'string',
      name: 'recordId',
      index: true,
      comment: 'Target record primary key value',
    },
    // Author
    {
      type: 'belongsTo',
      name: 'user',
      target: 'users',
      foreignKey: 'userId',
      interface: 'm2o',
      uiSchema: {
        type: 'object',
        title: `{{t("Author", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'AssociationField',
        'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } },
      },
    },
    // Content (rich text)
    {
      type: 'text',
      name: 'content',
      interface: 'richText',
      uiSchema: {
        type: 'string',
        title: `{{t("Content", { ns: "${NAMESPACE}" })}}`,
        'x-component': 'RichText',
      },
    },
    // Plain text version for search
    {
      type: 'text',
      name: 'contentText',
      comment: 'Plain-text version of content for full-text search',
    },
    // Threaded replies: parent comment
    {
      type: 'belongsTo',
      name: 'parent',
      target: 'comments',
      foreignKey: 'parentId',
    },
    {
      type: 'hasMany',
      name: 'replies',
      target: 'comments',
      foreignKey: 'parentId',
    },
    // Attachments (file IDs)
    {
      type: 'jsonb',
      name: 'attachments',
      defaultValue: [],
    },
    // @mentions (user IDs)
    {
      type: 'jsonb',
      name: 'mentions',
      defaultValue: [],
      comment: 'Array of user IDs mentioned in this comment',
    },
    // Status
    {
      type: 'string',
      name: 'status',
      defaultValue: 'active',
    },
    // Edit tracking
    {
      type: 'boolean',
      name: 'edited',
      defaultValue: false,
    },
    {
      type: 'date',
      name: 'editedAt',
    },
  ],
  indexes: [
    {
      fields: ['collectionName', 'recordId'],
    },
  ],
});

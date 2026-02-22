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
  name: 'userFavorites',
  title: 'User Favorites',
  fields: [
    { type: 'integer', name: 'userId' },
    { type: 'string', name: 'type' },
    { type: 'string', name: 'title' },
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'recordId' },
    { type: 'string', name: 'url' },
    { type: 'string', name: 'icon' },
    { type: 'integer', name: 'sort', defaultValue: 0 },
  ],
});

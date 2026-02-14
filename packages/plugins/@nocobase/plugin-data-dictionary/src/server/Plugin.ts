/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * Data Dictionary Plugin
 *
 * Provides centralized management of enumeration/option data.
 * Dictionaries can be referenced by collection fields as option sources,
 * eliminating duplicate option definitions across the system.
 *
 * Features:
 * - CRUD for dictionaries and items
 * - Cascading parent-child items
 * - Color and icon for each item
 * - Enable/disable items without deletion
 * - System dictionaries (protected from deletion)
 * - Import/export dictionaries
 */
export default class PluginDataDictionaryServer extends Plugin {
  async load() {
    // Register resources
    this.app.resourceManager.define({
      name: 'dictionaries',
      actions: {
        getByCode: this.getByCode.bind(this),
      },
    });

    this.app.resourceManager.define({
      name: 'dictionaryItems',
    });

    // ACL
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['dictionaries:*', 'dictionaryItems:*'],
    });

    // Public read access: any logged-in user can read dictionaries
    this.app.acl.allow('dictionaries', ['list', 'get', 'getByCode'], 'loggedIn');
    this.app.acl.allow('dictionaryItems', ['list', 'get'], 'loggedIn');
  }

  /**
   * Get a dictionary by its unique code, including all enabled items.
   */
  async getByCode(ctx: any, next: any) {
    const { code } = ctx.action.params;
    if (!code) {
      return ctx.throw(400, 'Dictionary code is required');
    }

    const dictionary = await ctx.db.getRepository('dictionaries').findOne({
      filter: { code, enabled: true },
      appends: ['items'],
    });

    if (!dictionary) {
      return ctx.throw(404, `Dictionary "${code}" not found`);
    }

    // Filter and sort items
    const items = (dictionary.items || [])
      .filter((item: any) => item.enabled)
      .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));

    ctx.body = {
      ...dictionary.toJSON(),
      items,
    };

    await next();
  }
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { dictionaryFieldInterface } from './DictionaryFieldInterface';

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
 * - Dictionary field interface for collection fields
 */
export default class PluginDataDictionaryServer extends Plugin {
  async load() {
    // Register the dictionary field interface so it appears in the field type list
    const dataSourceMainPlugin = this.app.pm.get('data-source-main') as any;
    if (dataSourceMainPlugin?.collectionManager?.db?.interfaceManager) {
      dataSourceMainPlugin.collectionManager.db.interfaceManager.registerInterfaceType(
        'dictionary',
        dictionaryFieldInterface,
      );
    }

    // Also seed system dictionaries on install
    this.app.on('afterInstall', async () => {
      await this.seedSystemDictionaries();
    });

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

  /**
   * Seed commonly-used system dictionaries on first install.
   */
  private async seedSystemDictionaries() {
    const repo = this.app.db.getRepository('dictionaries');
    const itemRepo = this.app.db.getRepository('dictionaryItems');

    const systemDicts = [
      {
        code: 'priority',
        title: 'Priority',
        items: [
          { value: 'low', label: 'Low', color: 'default', sort: 1 },
          { value: 'medium', label: 'Medium', color: 'blue', sort: 2, isDefault: true },
          { value: 'high', label: 'High', color: 'orange', sort: 3 },
          { value: 'urgent', label: 'Urgent', color: 'red', sort: 4 },
        ],
      },
      {
        code: 'status',
        title: 'Status',
        items: [
          { value: 'draft', label: 'Draft', color: 'default', sort: 1 },
          { value: 'active', label: 'Active', color: 'green', sort: 2, isDefault: true },
          { value: 'completed', label: 'Completed', color: 'blue', sort: 3 },
          { value: 'cancelled', label: 'Cancelled', color: 'red', sort: 4 },
          { value: 'archived', label: 'Archived', color: 'default', sort: 5 },
        ],
      },
      {
        code: 'gender',
        title: 'Gender',
        items: [
          { value: 'male', label: 'Male', sort: 1 },
          { value: 'female', label: 'Female', sort: 2 },
          { value: 'other', label: 'Other', sort: 3 },
        ],
      },
      {
        code: 'yes_no',
        title: 'Yes / No',
        items: [
          { value: 'yes', label: 'Yes', color: 'green', sort: 1 },
          { value: 'no', label: 'No', color: 'red', sort: 2 },
        ],
      },
    ];

    for (const dict of systemDicts) {
      const existing = await repo.findOne({ filter: { code: dict.code } });
      if (existing) continue;

      const created = await repo.create({
        values: {
          code: dict.code,
          title: dict.title,
          enabled: true,
          system: true,
        },
      });

      for (const item of dict.items) {
        await itemRepo.create({
          values: {
            ...item,
            dictionaryId: created.id,
            enabled: true,
          },
        });
      }
    }
  }
}

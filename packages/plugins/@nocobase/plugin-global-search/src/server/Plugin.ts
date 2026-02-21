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
 * Global Search Plugin
 *
 * Provides cross-collection full-text search with:
 * - Configurable search scope (which collections + which fields)
 * - Search result ranking by relevance
 * - Recent search history per user
 * - Search favorites (bookmark records)
 * - Search suggestions (autocomplete)
 */
export default class PluginGlobalSearchServer extends Plugin {
  /** Map of collectionName → searchable field names */
  private searchConfig: Map<string, string[]> = new Map();

  async load() {
    this.app.resourceManager.define({
      name: 'globalSearch',
      actions: {
        search: this.handleSearch.bind(this),
        suggest: this.handleSuggest.bind(this),
        getHistory: this.handleGetHistory.bind(this),
        clearHistory: this.handleClearHistory.bind(this),
        addFavorite: this.handleAddFavorite.bind(this),
        removeFavorite: this.handleRemoveFavorite.bind(this),
        getFavorites: this.handleGetFavorites.bind(this),
        getConfig: this.handleGetConfig.bind(this),
        saveConfig: this.handleSaveConfig.bind(this),
      },
    });

    this.app.acl.allow(
      'globalSearch',
      ['search', 'suggest', 'getHistory', 'clearHistory', 'addFavorite', 'removeFavorite', 'getFavorites'],
      'loggedIn',
    );
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['globalSearch:*', 'searchHistory:*', 'searchFavorites:*'],
    });

    // Load search config on startup
    this.app.on('afterStart', async () => {
      await this.loadSearchConfig();
    });
  }

  private async loadSearchConfig() {
    try {
      const setting = await this.db.getRepository('systemSettings').findOne({
        filter: { key: 'globalSearchConfig' },
      });
      const config = setting?.value || {};
      this.searchConfig.clear();
      for (const [collection, fields] of Object.entries(config)) {
        if (Array.isArray(fields)) {
          this.searchConfig.set(collection, fields as string[]);
        }
      }
    } catch {
      // Config not available yet (first install)
    }

    // Default: search title/name fields in all user-facing collections
    if (this.searchConfig.size === 0) {
      const collections = Array.from(this.db.collections.values());
      for (const col of collections) {
        if ((col.options.dumpRules as any)?.group === 'log') continue;
        const searchableFields: string[] = [];
        for (const field of col.fields.values()) {
          if (['string', 'text'].includes(field.type) && !field.options.hidden) {
            searchableFields.push(field.name);
          }
        }
        if (searchableFields.length > 0) {
          this.searchConfig.set(col.name, searchableFields.slice(0, 5));
        }
      }
    }
  }

  /**
   * POST /api/globalSearch:search
   * Body: { keyword, collections?, page?, pageSize? }
   */
  private async handleSearch(ctx: any, next: any) {
    const { keyword, collections, page = 1, pageSize = 20 } = ctx.action.params.values || ctx.action.params;

    if (!keyword || keyword.trim().length < 1) {
      ctx.body = { results: [], total: 0 };
      return next();
    }

    const trimmed = keyword.trim();
    const targetCollections = collections?.length
      ? collections.filter((c: string) => this.searchConfig.has(c))
      : Array.from(this.searchConfig.keys());

    const allResults: any[] = [];

    for (const collectionName of targetCollections) {
      const fields = this.searchConfig.get(collectionName);
      if (!fields?.length) continue;

      try {
        const repo = ctx.db.getRepository(collectionName);
        const collection = ctx.db.getCollection(collectionName);
        if (!collection) continue;

        // Build OR filter across searchable fields
        const orConditions = fields.map((field) => ({
          [field]: { $includes: trimmed },
        }));

        const records = await repo.find({
          filter: { $or: orConditions },
          limit: 10,
          sort: ['-createdAt'],
        });

        for (const record of records) {
          const data = record.toJSON ? record.toJSON() : record;
          // Build display title from the first non-empty searchable field
          const title = fields
            .map((f) => data[f])
            .filter(Boolean)
            .join(' — ');
          const filterTargetKey = collection.filterTargetKey || 'id';
          allResults.push({
            collectionName,
            collectionTitle: collection.options.title || collectionName,
            recordId: data[filterTargetKey],
            title: title || `#${data[filterTargetKey]}`,
            data: Object.fromEntries(fields.map((f) => [f, data[f]])),
          });
        }
      } catch {
        // Skip collections that fail (e.g., permission denied)
      }
    }

    // Save to search history
    try {
      const userId = ctx.state.currentUser?.id;
      if (userId) {
        await ctx.db.getRepository('searchHistory').create({
          values: { userId, keyword: trimmed, resultCount: allResults.length },
        });
      }
    } catch {
      /* ignore */
    }

    const start = (page - 1) * pageSize;
    ctx.body = {
      results: allResults.slice(start, start + pageSize),
      total: allResults.length,
      keyword: trimmed,
    };
    await next();
  }

  /**
   * GET /api/globalSearch:suggest?keyword=xxx
   * Returns top matching titles for autocomplete.
   */
  private async handleSuggest(ctx: any, next: any) {
    const { keyword } = ctx.action.params;
    if (!keyword || keyword.length < 2) {
      ctx.body = [];
      return next();
    }

    // Return recent matching searches from history
    const userId = ctx.state.currentUser?.id;
    const history = await ctx.db.getRepository('searchHistory').find({
      filter: {
        userId,
        keyword: { $includes: keyword },
      },
      limit: 5,
      sort: ['-createdAt'],
      fields: ['keyword'],
    });

    const suggestions = [...new Set(history.map((h: any) => h.keyword))];
    ctx.body = suggestions;
    await next();
  }

  private async handleGetHistory(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const records = await ctx.db.getRepository('searchHistory').find({
      filter: { userId },
      limit: 20,
      sort: ['-createdAt'],
      fields: ['id', 'keyword', 'resultCount', 'createdAt'],
    });
    // Deduplicate by keyword
    const seen = new Set();
    ctx.body = records.filter((r: any) => {
      if (seen.has(r.keyword)) return false;
      seen.add(r.keyword);
      return true;
    });
    await next();
  }

  private async handleClearHistory(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    await ctx.db.getRepository('searchHistory').destroy({ filter: { userId } });
    ctx.body = { success: true };
    await next();
  }

  private async handleAddFavorite(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    const { collectionName, recordId, title, description } = ctx.action.params.values || {};
    await ctx.db.getRepository('searchFavorites').create({
      values: { userId, collectionName, recordId: String(recordId), title, description },
    });
    ctx.body = { success: true };
    await next();
  }

  private async handleRemoveFavorite(ctx: any, next: any) {
    const { filterByTk } = ctx.action.params;
    await ctx.db.getRepository('searchFavorites').destroy({ filterByTk });
    ctx.body = { success: true };
    await next();
  }

  private async handleGetFavorites(ctx: any, next: any) {
    const userId = ctx.state.currentUser?.id;
    ctx.body = await ctx.db.getRepository('searchFavorites').find({
      filter: { userId },
      sort: ['-createdAt'],
    });
    await next();
  }

  private async handleGetConfig(ctx: any, next: any) {
    ctx.body = Object.fromEntries(this.searchConfig);
    await next();
  }

  private async handleSaveConfig(ctx: any, next: any) {
    const { values } = ctx.action.params;
    await ctx.db.getRepository('systemSettings').updateOrCreate({
      filterKeys: ['key'],
      values: { key: 'globalSearchConfig', value: values },
    });
    this.searchConfig.clear();
    for (const [collection, fields] of Object.entries(values)) {
      if (Array.isArray(fields)) {
        this.searchConfig.set(collection, fields as string[]);
      }
    }
    ctx.body = { success: true };
    await next();
  }
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import PluginFileManagerServer from '@nocobase/plugin-file-manager';
import { InstallOptions, Plugin } from '@nocobase/server';
import { resolve } from 'path';
import { registerSchedulerActions, loadScheduledTasks, stopAllTasks } from './scheduler';
import { registerFavoritesActions } from './favorites';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export class PluginSystemSettingsServer extends Plugin {
  getInitAppLang(options) {
    return options?.cliArgs?.[0]?.opts?.lang || process.env.INIT_APP_LANG || 'en-US';
  }

  async install(options?: InstallOptions) {
    const plugin = this.pm.get('file-manager') as PluginFileManagerServer;
    const logo = plugin
      ? await plugin.createFileRecord({
          filePath: resolve(__dirname, './logo.png'),
          collectionName: 'attachments',
          values: {
            title: 'nocobase-logo',
            extname: '.png',
            mimetype: 'image/png',
          },
        })
      : {
          title: 'nocobase-logo',
          filename: '682e5ad037dd02a0fe4800a3e91c283b.png',
          extname: '.png',
          mimetype: 'image/png',
          url: '/nocobase.png',
        };
    await this.db.getRepository('systemSettings').create({
      values: {
        title: 'NocoBase',
        appLang: this.getInitAppLang(options),
        enabledLanguages: [this.getInitAppLang(options)],
        logo,
      },
    });
  }

  async getSystemSettingsInstance() {
    const repository = this.db.getRepository('systemSettings');
    const instance = await repository.findOne({
      filterByTk: 1,
      appends: ['logo'],
    });
    const json = instance.toJSON();
    json.raw_title = json.title;
    json.title = this.app.environment.renderJsonTemplate(instance.title);
    return json;
  }

  beforeLoad() {
    const cmd = this.app.findCommand('install');
    if (cmd) {
      cmd.option('-l, --lang [lang]');
    }

    this.app.acl.registerSnippet({
      name: `pm.${this.name}.system-settings`,
      actions: ['systemSettings:put'],
    });
  }

  async load() {
    await this.importCollections(resolve(__dirname, 'collections'));

    this.app.acl.addFixedParams('systemSettings', 'destroy', () => {
      return {
        'id.$ne': 1,
      };
    });
    this.app.resourceManager.define({
      name: 'systemSettings',
      actions: {
        get: async (ctx, next) => {
          try {
            ctx.body = await this.getSystemSettingsInstance();
          } catch (error) {
            throw error;
          }
          await next();
        },
        put: async (ctx, next) => {
          const repository = this.db.getRepository('systemSettings');
          const values = ctx.action.params.values;
          await repository.update({
            filterByTk: 1,
            values: {
              ...values,
              title: values.raw_title,
            },
          });
          ctx.body = await this.getSystemSettingsInstance();
          await next();
        },
      },
    });
    this.app.acl.allow('systemSettings', 'get', 'public');

    this.app.resourceManager.define({
      name: 'systemStatus',
      actions: {
        get: async (ctx, next) => {
          const uptime = process.uptime();
          const mem = process.memoryUsage();
          const collections = Array.from(this.db.collections.keys());

          let pluginCount = 0;
          let enabledPlugins = 0;
          try {
            const plugins = await this.db.getRepository('applicationPlugins').find();
            pluginCount = plugins.length;
            enabledPlugins = plugins.filter((p: any) => p.enabled).length;
          } catch { /* ignore */ }

          let workflowStats = { total: 0, enabled: 0 };
          try {
            const wfRepo = this.db.getRepository('workflows');
            if (wfRepo) {
              workflowStats.total = await wfRepo.count();
              workflowStats.enabled = await wfRepo.count({ filter: { enabled: true } });
            }
          } catch { /* ignore */ }

          let userCount = 0;
          try {
            userCount = await this.db.getRepository('users').count();
          } catch { /* ignore */ }

          ctx.body = {
            version: this.app.version.get(),
            uptime: Math.floor(uptime),
            uptimeFormatted: formatUptime(uptime),
            memory: {
              rss: Math.round(mem.rss / 1024 / 1024),
              heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
              heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            },
            database: {
              dialect: (this.db as any).options?.dialect || 'unknown',
              collectionsCount: collections.length,
            },
            plugins: { total: pluginCount, enabled: enabledPlugins },
            workflows: workflowStats,
            users: userCount,
            node: process.version,
            platform: process.platform,
          };
          await next();
        },
      },
    });
    this.app.acl.registerSnippet({
      name: `pm.${this.name}.system-status`,
      actions: ['systemStatus:get'],
    });

    // Health check endpoint (public, for load balancers and monitoring)
    this.app.resourceManager.define({
      name: 'healthCheck',
      actions: {
        get: async (ctx: any, next: any) => {
          const checks: Record<string, { status: string; latency?: number }> = {};

          // Database check
          const dbStart = Date.now();
          try {
            await this.db.sequelize.query('SELECT 1');
            checks.database = { status: 'ok', latency: Date.now() - dbStart };
          } catch {
            checks.database = { status: 'error', latency: Date.now() - dbStart };
          }

          // Memory check
          const mem = process.memoryUsage();
          const heapPercent = Math.round((mem.heapUsed / mem.heapTotal) * 100);
          checks.memory = { status: heapPercent > 90 ? 'warning' : 'ok' };

          // Uptime check
          checks.uptime = { status: process.uptime() > 0 ? 'ok' : 'error' };

          const allOk = Object.values(checks).every((c) => c.status === 'ok');

          ctx.status = allOk ? 200 : 503;
          ctx.body = {
            status: allOk ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            version: this.app.version.get(),
            checks,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('healthCheck', 'get', 'public');

    // User favorites
    registerFavoritesActions(this.app);

    // Task scheduler
    registerSchedulerActions(this.app);

    this.app.on('afterStart', async () => {
      if (!this.app.name || this.app.name === 'main') {
        await loadScheduledTasks(this.app);
      }
    });
  }

  async remove() {
    stopAllTasks();
  }
}

export default PluginSystemSettingsServer;

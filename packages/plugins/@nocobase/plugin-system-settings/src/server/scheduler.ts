/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Lightweight Task Scheduler
 *
 * Provides a configurable scheduler for automated periodic tasks:
 * - Data cleanup (old logs, expired tokens, recycle bin purge)
 * - Report generation and push
 * - Data aggregation (daily/weekly summaries)
 * - Health checks and alerting
 *
 * Uses simple setInterval-based scheduling (no external deps).
 * Tasks are stored in DB and loaded on app start.
 */

export interface ScheduledTask {
  id?: number;
  name: string;
  type: string;
  cronExpression?: string;
  intervalMinutes: number;
  config: Record<string, any>;
  enabled: boolean;
  lastRunAt?: Date;
  lastRunStatus?: string;
  nextRunAt?: Date;
}

const runningTimers = new Map<string, NodeJS.Timeout>();

const BUILT_IN_TASKS: Record<string, (app: any, config: any) => Promise<string>> = {
  'cleanup:auditLogs': async (app, config) => {
    const days = config?.retentionDays || 180;
    const cutoff = new Date(Date.now() - days * 86400000);
    try {
      const repo = app.db.getRepository('auditLogs');
      if (!repo) return 'skipped: collection not found';
      const count = await repo.destroy({ filter: { createdAt: { $lt: cutoff } } });
      return `cleaned ${count || 0} audit logs older than ${days} days`;
    } catch (e: any) { return `error: ${e.message}`; }
  },

  'cleanup:recycleBin': async (app, config) => {
    const days = config?.retentionDays || 90;
    const cutoff = new Date(Date.now() - days * 86400000);
    try {
      const repo = app.db.getRepository('recycleBin');
      if (!repo) return 'skipped: collection not found';
      const count = await repo.destroy({ filter: { deletedAt: { $lt: cutoff } } });
      return `purged ${count || 0} recycle bin items older than ${days} days`;
    } catch (e: any) { return `error: ${e.message}`; }
  },

  'cleanup:expiredTokens': async (app) => {
    try {
      const repo = app.db.getRepository('tokenBlacklist');
      if (!repo) return 'skipped';
      const cutoff = new Date(Date.now() - 7 * 86400000);
      const count = await repo.destroy({ filter: { createdAt: { $lt: cutoff } } });
      return `cleaned ${count || 0} expired tokens`;
    } catch (e: any) { return `error: ${e.message}`; }
  },

  'stats:dailySummary': async (app) => {
    try {
      const userCount = await app.db.getRepository('users').count();
      const date = new Date().toISOString().slice(0, 10);
      app.logger.info(`[scheduler] Daily summary ${date}: ${userCount} users`);
      return `summary generated for ${date}`;
    } catch (e: any) { return `error: ${e.message}`; }
  },
};

export function registerSchedulerActions(app: any) {
  app.resourceManager.define({
    name: 'scheduler',
    actions: {
      async list(ctx: any, next: any) {
        const repo = ctx.db.getRepository('scheduledTasks');
        if (!repo) { ctx.body = []; return next(); }
        ctx.body = await repo.find({ sort: ['name'] });
        await next();
      },

      async create(ctx: any, next: any) {
        const values = ctx.action.params.values;
        const repo = ctx.db.getRepository('scheduledTasks');
        if (!repo) return ctx.throw(500, 'scheduledTasks collection not ready');
        const task = await repo.create({ values });
        if (task.enabled) scheduleTask(app, task.toJSON ? task.toJSON() : task);
        ctx.body = task;
        await next();
      },

      async update(ctx: any, next: any) {
        const { filterByTk, values } = ctx.action.params;
        const repo = ctx.db.getRepository('scheduledTasks');
        if (!repo) return ctx.throw(500);
        await repo.update({ filterByTk, values });
        const task = await repo.findOne({ filterByTk });
        const data = task.toJSON ? task.toJSON() : task;
        cancelTask(data.name);
        if (data.enabled) scheduleTask(app, data);
        ctx.body = task;
        await next();
      },

      async destroy(ctx: any, next: any) {
        const { filterByTk } = ctx.action.params;
        const repo = ctx.db.getRepository('scheduledTasks');
        if (!repo) return ctx.throw(500);
        const task = await repo.findOne({ filterByTk });
        if (task) cancelTask(task.name);
        await repo.destroy({ filterByTk });
        ctx.body = { success: true };
        await next();
      },

      async runNow(ctx: any, next: any) {
        const { filterByTk } = ctx.action.params;
        const repo = ctx.db.getRepository('scheduledTasks');
        if (!repo) return ctx.throw(500);
        const task = await repo.findOne({ filterByTk });
        if (!task) return ctx.throw(404);
        const data = task.toJSON ? task.toJSON() : task;
        const result = await executeTask(ctx.app, data);
        await repo.update({ filterByTk, values: { lastRunAt: new Date(), lastRunStatus: result } });
        ctx.body = { success: true, result };
        await next();
      },

      async getBuiltInTypes(ctx: any, next: any) {
        ctx.body = Object.keys(BUILT_IN_TASKS).map((type) => ({
          type,
          description: type.replace(/[:/]/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
        }));
        await next();
      },
    },
  });

  app.acl.registerSnippet({ name: 'pm.system-settings.scheduler', actions: ['scheduler:*'] });
}

function scheduleTask(app: any, task: ScheduledTask) {
  const interval = (task.intervalMinutes || 60) * 60 * 1000;
  const timer = setInterval(async () => {
    try {
      const result = await executeTask(app, task);
      const repo = app.db.getRepository('scheduledTasks');
      if (repo && task.id) {
        await repo.update({ filterByTk: task.id, values: { lastRunAt: new Date(), lastRunStatus: result, nextRunAt: new Date(Date.now() + interval) } });
      }
    } catch (e: any) {
      app.logger.error(`[scheduler] Task "${task.name}" failed: ${e.message}`);
    }
  }, interval);
  runningTimers.set(task.name, timer);
}

function cancelTask(name: string) {
  const timer = runningTimers.get(name);
  if (timer) { clearInterval(timer); runningTimers.delete(name); }
}

async function executeTask(app: any, task: ScheduledTask): Promise<string> {
  const handler = BUILT_IN_TASKS[task.type];
  if (handler) return handler(app, task.config || {});
  return `unknown task type: ${task.type}`;
}

export async function loadScheduledTasks(app: any) {
  try {
    const repo = app.db.getRepository('scheduledTasks');
    if (!repo) return;
    const tasks = await repo.find({ filter: { enabled: true } });
    for (const task of tasks) {
      const data = task.toJSON ? task.toJSON() : task;
      scheduleTask(app, data);
      app.logger.info(`[scheduler] Loaded task: ${data.name} (every ${data.intervalMinutes}m)`);
    }
  } catch { /* collection may not exist yet */ }
}

export function stopAllTasks() {
  for (const [name, timer] of runningTimers) {
    clearInterval(timer);
  }
  runningTimers.clear();
}

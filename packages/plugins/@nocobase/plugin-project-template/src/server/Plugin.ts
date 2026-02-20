/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedProjectData } from './seed-data';
import { createTemplateUI } from './ui-schema-generator';
import { createProjectWorkflows } from './workflows';
import { createProjectRoles } from './roles';

const PM_COLLECTIONS = ['pmProjects', 'pmTasks', 'pmMilestones', 'pmTimesheets', 'pmRisks'];

export default class PluginProjectTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    try {
      const result = await seedProjectData(this.db);
      if (result.created > 0) this.app.logger.info(`[project-template] Seeded ${result.created} records`);
    } catch (err) {
      this.app.logger.warn(`[project-template] Seed skipped: ${err.message}`);
    }
    try { const rc = await createProjectRoles(this.app); if (rc > 0) this.app.logger.info(`[project] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[project] Roles skipped: ${(e as any).message}`); }
    try { const wf = await createProjectWorkflows(this.app); if (wf > 0) this.app.logger.info(`[project] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[project] Workflows skipped: ${(e as any).message}`); }

    try {
      await createTemplateUI(this.app, '项目管理', 'ProjectOutlined', [
        { title: '项目列表', icon: 'ProjectOutlined', collectionName: 'pmProjects', fields: ['name', 'code', 'status', 'priority', 'progress', 'startDate', 'endDate', 'budget'], formFields: ['name', 'type', 'status', 'priority', 'startDate', 'endDate', 'budget', 'description', 'notes'] },
        { title: '任务列表', icon: 'UnorderedListOutlined', collectionName: 'pmTasks', fields: ['title', 'code', 'status', 'priority', 'dueDate', 'progress'], formFields: ['title', 'type', 'status', 'priority', 'startDate', 'dueDate', 'estimatedHours', 'description'] },
        { title: '里程碑', icon: 'FlagOutlined', collectionName: 'pmMilestones', fields: ['name', 'dueDate', 'status'], formFields: ['name', 'dueDate', 'status', 'description'] },
        { title: '工时记录', icon: 'ClockCircleOutlined', collectionName: 'pmTimesheets', fields: ['date', 'hours', 'description'], formFields: ['date', 'hours', 'description'] },
      ]);
    } catch (err) { this.app.logger.warn(`[project-template] UI creation skipped: ${(err as any).message}`); }
  }

  async load() {
    for (const c of PM_COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: PM_COLLECTIONS.map((c) => `${c}:*`),
    });

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'pmDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const [projects, tasks] = await Promise.all([
            db.getRepository('pmProjects').find({ fields: ['status', 'progress', 'budget', 'actualCost'] }),
            db.getRepository('pmTasks').find({ fields: ['status', 'priority', 'projectId', 'dueDate', 'completedAt'] }),
          ]);

          const projectList = (projects || []).map((p: any) => (p.toJSON ? p.toJSON() : p));
          const taskList = (tasks || []).map((t: any) => (t.toJSON ? t.toJSON() : t));

          const activeProjects = projectList.filter((p: any) => p.status === 'in_progress').length;
          const completedProjects = projectList.filter((p: any) => p.status === 'completed').length;
          const totalBudget = projectList.reduce((s: number, p: any) => s + (p.budget || 0), 0);
          const totalCost = projectList.reduce((s: number, p: any) => s + (p.actualCost || 0), 0);

          const tasksByStatus: Record<string, number> = {};
          const tasksByPriority: Record<string, number> = {};
          let overdueTasks = 0;
          const now = new Date();

          for (const t of taskList) {
            tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
            tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
            if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'done') {
              overdueTasks++;
            }
          }

          ctx.body = {
            totalProjects: projectList.length,
            activeProjects,
            completedProjects,
            totalTasks: taskList.length,
            tasksByStatus,
            tasksByPriority,
            overdueTasks,
            totalBudget,
            totalCost,
            avgProgress: projectList.length
              ? Math.round(projectList.reduce((s: number, p: any) => s + (p.progress || 0), 0) / projectList.length)
              : 0,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('pmDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('pmProjects.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const count = await this.db.getRepository('pmProjects').count();
        model.set('code', `P${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('pmTasks.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const projectId = model.get('projectId');
        const prefix = projectId ? `T${projectId}-` : 'T-';
        const count = await this.db.getRepository('pmTasks').count({
          filter: projectId ? { projectId } : {},
        });
        model.set('code', `${prefix}${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('pmTasks.beforeSave', async (model: any) => {
      if (model.get('status') === 'done' && !model.get('completedAt')) {
        model.set('completedAt', new Date());
        model.set('progress', 100);
      }
    });

    this.db.on('pmTasks.afterSave', async (model: any, options: any) => {
      const projectId = model.get('projectId');
      if (!projectId) return;

      try {
        const tasks = await this.db.getRepository('pmTasks').find({
          filter: { projectId },
          fields: ['progress'],
          transaction: options.transaction,
        });
        if (tasks.length === 0) return;

        const avgProgress = Math.round(
          tasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0) / tasks.length,
        );

        await this.db.getRepository('pmProjects').update({
          filterByTk: projectId,
          values: { progress: avgProgress },
          transaction: options.transaction,
        });
      } catch {
        // non-critical
      }
    });
  }
}

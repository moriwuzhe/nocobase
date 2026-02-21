/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedHrData } from './seed-data';
import { createTemplateUI } from './ui-schema-generator';
import { createHrWorkflows } from './workflows';
import { createHrRoles } from './roles';

const HR_COLLECTIONS = [
  'hrEmployees',
  'hrLeaveRequests',
  'hrAttendance',
  'hrOnboarding',
  'hrPerformance',
  'hrSalary',
  'hrTraining',
];

export default class PluginHrTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    // Skip heavy operations for sub-apps
    if (this.app.name && this.app.name !== 'main') return;

    try {
      const result = await seedHrData(this.db);
      if (result.created > 0) this.app.logger.info(`[hr-template] Seeded ${result.created} records`);
    } catch (err) {
      this.app.logger.warn(`[hr-template] Seed skipped: ${(err as any).message}`);
    }
    try { const rc = await createHrRoles(this.app); if (rc > 0) this.app.logger.info(`[hr] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[hr] Roles skipped: ${(e as any).message}`); }
    try { const wf = await createHrWorkflows(this.app); if (wf > 0) this.app.logger.info(`[hr] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[hr] Workflows skipped: ${(e as any).message}`); }

    try {
      await createTemplateUI(this.app, '人事管理 HR', 'TeamOutlined', [
        { title: '员工档案', icon: 'IdcardOutlined', collectionName: 'hrEmployees', fields: ['employeeId', 'name', 'department', 'position', 'level', 'status', 'phone', 'email'], formFields: ['name', 'gender', 'department', 'position', 'level', 'employmentType', 'status', 'phone', 'email', 'hireDate', 'education', 'address', 'idNumber', 'bankAccount', 'emergencyContact', 'emergencyPhone'] },
        { title: '请假管理', icon: 'CalendarOutlined', collectionName: 'hrLeaveRequests', fields: ['type', 'startDate', 'endDate', 'days', 'status', 'reason'], formFields: ['type', 'startDate', 'endDate', 'reason'] },
        { title: '考勤记录', icon: 'ClockCircleOutlined', collectionName: 'hrAttendance', fields: ['date', 'checkIn', 'checkOut', 'status'], formFields: ['date', 'checkIn', 'checkOut', 'status', 'remark'] },
        { title: '培训管理', icon: 'ReadOutlined', collectionName: 'hrTraining', fields: ['title', 'type', 'startDate', 'endDate', 'status'], formFields: ['title', 'type', 'startDate', 'endDate', 'location', 'description'] },
        { title: '绩效评估', icon: 'TrophyOutlined', collectionName: 'hrPerformance', fields: ['period', 'score', 'grade', 'status'], formFields: ['period', 'score', 'grade', 'selfEvaluation', 'managerComment'] },
      ]);
    } catch (err) { this.app.logger.warn(`[hr-template] UI creation skipped: ${(err as any).message}`); }
  }

  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: HR_COLLECTIONS.map((c) => `${c}:*`),
    });
    for (const c of HR_COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'hrDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const [employees, leaves] = await Promise.all([
            db.getRepository('hrEmployees').find({ fields: ['status', 'department', 'hireDate'] }),
            db.getRepository('hrLeaveRequests').find({
              fields: ['status', 'type', 'startDate', 'endDate', 'days'],
            }),
          ]);

          const empList = (employees || []).map((e: any) => (e.toJSON ? e.toJSON() : e));
          const leaveList = (leaves || []).map((l: any) => (l.toJSON ? l.toJSON() : l));

          const activeCount = empList.filter((e: any) => e.status === 'active').length;
          const probationCount = empList.filter((e: any) => e.status === 'probation').length;
          const onLeaveCount = empList.filter((e: any) => e.status === 'on_leave').length;

          const byDepartment: Record<string, number> = {};
          for (const e of empList) {
            const dept = e.department || '未分配';
            byDepartment[dept] = (byDepartment[dept] || 0) + 1;
          }

          const pendingLeaves = leaveList.filter((l: any) => l.status === 'pending').length;
          const approvedLeaves = leaveList.filter((l: any) => l.status === 'approved').length;

          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          const newHiresThisMonth = empList.filter((e: any) => {
            if (!e.hireDate) return false;
            const d = new Date(e.hireDate);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          }).length;

          ctx.body = {
            totalEmployees: empList.length,
            activeCount,
            probationCount,
            onLeaveCount,
            byDepartment,
            pendingLeaves,
            approvedLeaves,
            newHiresThisMonth,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('hrDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('hrEmployees.beforeCreate', async (model: any) => {
      if (!model.get('employeeId')) {
        const count = await this.db.getRepository('hrEmployees').count();
        model.set('employeeId', `EMP${String(count + 1).padStart(5, '0')}`);
      }
    });

    this.db.on('hrLeaveRequests.beforeSave', async (model: any) => {
      const startDate = model.get('startDate');
      const endDate = model.get('endDate');
      if (startDate && endDate) {
        const days = Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
        model.set('days', Math.max(days, 1));
      }
    });

    this.db.on('hrLeaveRequests.afterSave', async (model: any, options: any) => {
      if (model.get('status') === 'approved') {
        const employeeId = model.get('employeeId');
        if (employeeId) {
          try {
            await this.db.getRepository('hrEmployees').update({
              filterByTk: employeeId,
              values: { status: 'on_leave' },
              transaction: options.transaction,
            });
          } catch {
            // non-critical
          }
        }
      }
    });
  }
}

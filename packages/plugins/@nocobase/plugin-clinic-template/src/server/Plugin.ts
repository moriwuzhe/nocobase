/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
import { createClinicRoles } from './roles';
import { createClinicWorkflows } from './workflows';

const COLLECTIONS = ['clinicPatients', 'clinicAppointments', 'clinicMedicalRecords', 'clinicPrescriptions'];
const DASHBOARD_ACTION = 'clinicDashboard:stats';

export default class PluginClinicTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;

    // Seed data
    try {
      if ((await this.db.getRepository('clinicPatients').count()) === 0) {
        const patients = [
          { name: '张三', gender: 'male', phone: '13800001111', bloodType: 'A', allergies: '青霉素过敏' },
          { name: '李四', gender: 'female', phone: '13800002222', bloodType: 'O', allergies: '无' },
          { name: '王五', gender: 'male', phone: '13800003333', bloodType: 'B', medicalHistory: '高血压' },
        ];
        for (const p of patients) await this.db.getRepository('clinicPatients').create({ values: p });
        this.app.logger.info('[clinic] Seeded 3 patients');
      }
    } catch (e) {
      this.app.logger.warn(`[clinic] Seed skipped: ${(e as any).message}`);
    }

    try {
      const roleCount = await createClinicRoles(this.app);
      if (roleCount > 0) this.app.logger.info(`[clinic] Created ${roleCount} roles`);
    } catch (e) {
      this.app.logger.warn(`[clinic] Roles skipped: ${(e as any).message}`);
    }

    try {
      const workflowCount = await createClinicWorkflows(this.app);
      if (workflowCount > 0) this.app.logger.info(`[clinic] Created ${workflowCount} workflows`);
    } catch (e) {
      this.app.logger.warn(`[clinic] Workflows skipped: ${(e as any).message}`);
    }

    // UI pages
    try {
      await createTemplateUI(this.app, '诊所管理', 'MedicineBoxOutlined', [
        {
          title: '患者管理',
          icon: 'UserOutlined',
          collectionName: 'clinicPatients',
          fields: ['patientNo', 'name', 'gender', 'phone', 'bloodType', 'allergies'],
          formFields: [
            'name',
            'gender',
            'birthDate',
            'phone',
            'idNumber',
            'bloodType',
            'allergies',
            'medicalHistory',
            'emergencyContact',
            'emergencyPhone',
            'address',
          ],
        },
        {
          title: '预约管理',
          icon: 'CalendarOutlined',
          collectionName: 'clinicAppointments',
          fields: ['appointmentDate', 'timeSlot', 'doctor', 'department', 'status', 'reason'],
          formFields: ['appointmentDate', 'timeSlot', 'doctor', 'department', 'status', 'reason', 'notes'],
        },
        {
          title: '病历记录',
          icon: 'FileTextOutlined',
          collectionName: 'clinicMedicalRecords',
          fields: ['visitDate', 'doctor', 'department', 'chiefComplaint', 'diagnosis', 'fee', 'paymentStatus'],
          formFields: [
            'visitDate',
            'doctor',
            'department',
            'chiefComplaint',
            'diagnosis',
            'treatment',
            'prescription',
            'fee',
            'paymentStatus',
            'followUpDate',
          ],
        },
        {
          title: '处方管理',
          icon: 'ExperimentOutlined',
          collectionName: 'clinicPrescriptions',
          fields: ['prescriptionNo', 'doctor', 'prescriptionDate', 'status', 'totalCost'],
          formFields: ['doctor', 'prescriptionDate', 'medications', 'dosageInstructions', 'status', 'totalCost'],
        },
      ]);
    } catch (e) {
      this.app.logger.warn(`[clinic] UI skipped: ${(e as any).message}`);
    }
  }

  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: [...COLLECTIONS.map((c) => `${c}:*`), DASHBOARD_ACTION],
    });

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'clinicDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const [patients, appointments, records, prescriptions] = await Promise.all([
            ctx.db.getRepository('clinicPatients').count(),
            ctx.db.getRepository('clinicAppointments').find({
              fields: ['status', 'appointmentDate'],
            }),
            ctx.db.getRepository('clinicMedicalRecords').find({
              fields: ['paymentStatus'],
            }),
            ctx.db.getRepository('clinicPrescriptions').count(),
          ]);

          const appointmentList = (appointments || []).map((item: any) => (item.toJSON ? item.toJSON() : item));
          const recordList = (records || []).map((item: any) => (item.toJSON ? item.toJSON() : item));

          const waitingAppointments = appointmentList.filter((item: any) =>
            ['scheduled', 'checked_in', 'in_progress'].includes(item.status),
          ).length;
          const completedAppointments = appointmentList.filter((item: any) => item.status === 'completed').length;
          const unpaidRecords = recordList.filter((item: any) => item.paymentStatus === 'unpaid').length;

          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date(startOfToday);
          endOfToday.setDate(endOfToday.getDate() + 1);

          const todayAppointments = appointmentList.filter((item: any) => {
            if (!item.appointmentDate) return false;
            const visitDate = new Date(item.appointmentDate);
            return visitDate >= startOfToday && visitDate < endOfToday;
          }).length;

          ctx.body = {
            totalPatients: patients,
            totalAppointments: appointmentList.length,
            waitingAppointments,
            completedAppointments,
            todayAppointments,
            totalRecords: recordList.length,
            unpaidRecords,
            totalPrescriptions: prescriptions,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('clinicDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('clinicPatients.beforeCreate', async (model: any) => {
      if (!model.get('patientNo')) {
        const count = await this.db.getRepository('clinicPatients').count();
        model.set('patientNo', `P${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('clinicPrescriptions.beforeCreate', async (model: any) => {
      if (!model.get('prescriptionNo')) {
        const date = new Date();
        const count = await this.db.getRepository('clinicPrescriptions').count();
        model.set(
          'prescriptionNo',
          `RX${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(
            4,
            '0',
          )}`,
        );
      }
    });
  }
}

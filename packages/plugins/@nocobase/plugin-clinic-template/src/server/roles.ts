/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export async function createClinicRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  const dashboardAction = 'clinicDashboard:stats';

  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'clinic-admin' } }))) {
      await roleRepo.create({
        values: {
          name: 'clinic-admin',
          title: '诊所管理员',
          hidden: false,
          strategy: {
            actions: [
              'clinicPatients:list',
              'clinicPatients:get',
              'clinicPatients:create',
              'clinicPatients:update',
              'clinicPatients:destroy',
              'clinicAppointments:list',
              'clinicAppointments:get',
              'clinicAppointments:create',
              'clinicAppointments:update',
              'clinicAppointments:destroy',
              'clinicMedicalRecords:list',
              'clinicMedicalRecords:get',
              'clinicMedicalRecords:create',
              'clinicMedicalRecords:update',
              'clinicMedicalRecords:destroy',
              'clinicPrescriptions:list',
              'clinicPrescriptions:get',
              'clinicPrescriptions:create',
              'clinicPrescriptions:update',
              'clinicPrescriptions:destroy',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[clinic] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'clinic-doctor' } }))) {
      await roleRepo.create({
        values: {
          name: 'clinic-doctor',
          title: '接诊医生',
          hidden: false,
          strategy: {
            actions: [
              'clinicPatients:list',
              'clinicPatients:get',
              'clinicAppointments:list',
              'clinicAppointments:get',
              'clinicAppointments:update',
              'clinicMedicalRecords:list',
              'clinicMedicalRecords:get',
              'clinicMedicalRecords:create',
              'clinicMedicalRecords:update',
              'clinicPrescriptions:list',
              'clinicPrescriptions:get',
              'clinicPrescriptions:create',
              'clinicPrescriptions:update',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[clinic] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'clinic-reception' } }))) {
      await roleRepo.create({
        values: {
          name: 'clinic-reception',
          title: '前台接待',
          hidden: false,
          strategy: {
            actions: [
              'clinicPatients:list',
              'clinicPatients:get',
              'clinicPatients:create',
              'clinicPatients:update',
              'clinicAppointments:list',
              'clinicAppointments:get',
              'clinicAppointments:create',
              'clinicAppointments:update',
              'clinicPrescriptions:list',
              'clinicPrescriptions:get',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[clinic] Role skipped: ${(e as any).message}`);
  }

  return created;
}

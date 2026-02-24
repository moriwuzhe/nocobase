/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export async function createLogisticsRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  const dashboardAction = 'logisticsDashboard:stats';

  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'logistics-admin' } }))) {
      await roleRepo.create({
        values: {
          name: 'logistics-admin',
          title: '物流管理员',
          hidden: false,
          strategy: {
            actions: [
              'logShipments:list',
              'logShipments:get',
              'logShipments:create',
              'logShipments:update',
              'logShipments:destroy',
              'logDrivers:list',
              'logDrivers:get',
              'logDrivers:create',
              'logDrivers:update',
              'logDrivers:destroy',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[logistics] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'logistics-dispatcher' } }))) {
      await roleRepo.create({
        values: {
          name: 'logistics-dispatcher',
          title: '调度员',
          hidden: false,
          strategy: {
            actions: [
              'logShipments:list',
              'logShipments:get',
              'logShipments:create',
              'logShipments:update',
              'logDrivers:list',
              'logDrivers:get',
              'logDrivers:update',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[logistics] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'logistics-driver' } }))) {
      await roleRepo.create({
        values: {
          name: 'logistics-driver',
          title: '司机',
          hidden: false,
          strategy: {
            actions: [
              'logShipments:list',
              'logShipments:get',
              'logShipments:update',
              'logDrivers:list',
              'logDrivers:get',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[logistics] Role skipped: ${(e as any).message}`);
  }

  return created;
}

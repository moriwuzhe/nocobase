/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export async function createRestaurantRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  const dashboardAction = 'restDashboard:stats';

  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'rest-admin' } }))) {
      await roleRepo.create({
        values: {
          name: 'rest-admin',
          title: '餐饮管理员',
          hidden: false,
          strategy: {
            actions: [
              'restMenuItems:list',
              'restMenuItems:get',
              'restMenuItems:create',
              'restMenuItems:update',
              'restMenuItems:destroy',
              'restOrders:list',
              'restOrders:get',
              'restOrders:create',
              'restOrders:update',
              'restOrders:destroy',
              'restTables:list',
              'restTables:get',
              'restTables:create',
              'restTables:update',
              'restTables:destroy',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[restaurant] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'rest-cashier' } }))) {
      await roleRepo.create({
        values: {
          name: 'rest-cashier',
          title: '收银员',
          hidden: false,
          strategy: {
            actions: [
              'restOrders:list',
              'restOrders:get',
              'restOrders:create',
              'restOrders:update',
              'restTables:list',
              'restTables:get',
              'restTables:update',
              'restMenuItems:list',
              'restMenuItems:get',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[restaurant] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'rest-chef' } }))) {
      await roleRepo.create({
        values: {
          name: 'rest-chef',
          title: '后厨',
          hidden: false,
          strategy: {
            actions: [
              'restOrders:list',
              'restOrders:get',
              'restOrders:update',
              'restMenuItems:list',
              'restMenuItems:get',
              'restMenuItems:update',
              dashboardAction,
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[restaurant] Role skipped: ${(e as any).message}`);
  }

  return created;
}

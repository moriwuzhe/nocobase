/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export async function createItAssetRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;

  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'it-asset-admin' } }))) {
      await roleRepo.create({
        values: {
          name: 'it-asset-admin',
          title: 'IT资产管理员',
          hidden: false,
          strategy: {
            actions: [
              'itDevices:list',
              'itDevices:get',
              'itDevices:create',
              'itDevices:update',
              'itDevices:destroy',
              'itLicenses:list',
              'itLicenses:get',
              'itLicenses:create',
              'itLicenses:update',
              'itLicenses:destroy',
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[it-asset] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'it-asset-manager' } }))) {
      await roleRepo.create({
        values: {
          name: 'it-asset-manager',
          title: 'IT运维',
          hidden: false,
          strategy: {
            actions: [
              'itDevices:list',
              'itDevices:get',
              'itDevices:create',
              'itDevices:update',
              'itLicenses:list',
              'itLicenses:get',
              'itLicenses:create',
              'itLicenses:update',
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[it-asset] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'it-asset-auditor' } }))) {
      await roleRepo.create({
        values: {
          name: 'it-asset-auditor',
          title: '资产审计',
          hidden: false,
          strategy: {
            actions: ['itDevices:list', 'itDevices:get', 'itLicenses:list', 'itLicenses:get'],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[it-asset] Role skipped: ${(e as any).message}`);
  }

  return created;
}

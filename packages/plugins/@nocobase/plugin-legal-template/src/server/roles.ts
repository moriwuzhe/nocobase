/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export async function createLegalRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;

  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'legal-admin' } }))) {
      await roleRepo.create({
        values: {
          name: 'legal-admin',
          title: '法务管理员',
          hidden: false,
          strategy: {
            actions: [
              'legalCases:list',
              'legalCases:get',
              'legalCases:create',
              'legalCases:update',
              'legalCases:destroy',
              'legalDocuments:list',
              'legalDocuments:get',
              'legalDocuments:create',
              'legalDocuments:update',
              'legalDocuments:destroy',
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[legal] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'legal-lawyer' } }))) {
      await roleRepo.create({
        values: {
          name: 'legal-lawyer',
          title: '执业律师',
          hidden: false,
          strategy: {
            actions: [
              'legalCases:list',
              'legalCases:get',
              'legalCases:create',
              'legalCases:update',
              'legalDocuments:list',
              'legalDocuments:get',
              'legalDocuments:create',
              'legalDocuments:update',
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[legal] Role skipped: ${(e as any).message}`);
  }

  try {
    if (!(await roleRepo.findOne({ filter: { name: 'legal-assistant' } }))) {
      await roleRepo.create({
        values: {
          name: 'legal-assistant',
          title: '法务助理',
          hidden: false,
          strategy: {
            actions: [
              'legalCases:list',
              'legalCases:get',
              'legalDocuments:list',
              'legalDocuments:get',
              'legalDocuments:create',
              'legalDocuments:update',
            ],
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[legal] Role skipped: ${(e as any).message}`);
  }

  return created;
}

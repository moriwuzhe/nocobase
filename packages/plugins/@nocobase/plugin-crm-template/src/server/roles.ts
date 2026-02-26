/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Create default roles for CRM template.
 *
 * Roles:
 * - crm-manager: Full access to all CRM collections
 * - crm-sales: Can manage customers, contacts, deals, activities; read-only on products
 * - crm-viewer: Read-only access to all CRM collections
 */

interface RoleDef {
  name: string;
  title: string;
  description?: string;
  collections: Record<string, string[]>;
}

const CRM_ROLES: RoleDef[] = [
  {
    name: 'crm-manager',
    title: 'CRM 管理员',
    description: '客户管理系统完全管理权限',
    collections: {
      crmCustomers: ['list', 'get', 'create', 'update', 'destroy'],
      crmContacts: ['list', 'get', 'create', 'update', 'destroy'],
      crmDeals: ['list', 'get', 'create', 'update', 'destroy'],
      crmActivities: ['list', 'get', 'create', 'update', 'destroy'],
      crmLeads: ['list', 'get', 'create', 'update', 'destroy'],
      crmProducts: ['list', 'get', 'create', 'update', 'destroy'],
      crmQuotes: ['list', 'get', 'create', 'update', 'destroy'],
      crmCampaigns: ['list', 'get', 'create', 'update', 'destroy'],
      crmContracts: ['list', 'get', 'create', 'update', 'destroy'],
      crmPayments: ['list', 'get', 'create', 'update', 'destroy'],
    },
  },
  {
    name: 'crm-sales',
    title: 'CRM 销售员',
    description: '销售人员日常操作权限',
    collections: {
      crmCustomers: ['list', 'get', 'create', 'update'],
      crmContacts: ['list', 'get', 'create', 'update'],
      crmDeals: ['list', 'get', 'create', 'update'],
      crmActivities: ['list', 'get', 'create', 'update'],
      crmLeads: ['list', 'get', 'create', 'update'],
      crmProducts: ['list', 'get'],
      crmQuotes: ['list', 'get', 'create'],
    },
  },
  {
    name: 'crm-viewer',
    title: 'CRM 查看者',
    description: '只读查看所有CRM数据',
    collections: {
      crmCustomers: ['list', 'get'],
      crmContacts: ['list', 'get'],
      crmDeals: ['list', 'get'],
      crmActivities: ['list', 'get'],
      crmProducts: ['list', 'get'],
    },
  },
];

export async function createCrmRoles(app: any): Promise<number> {
  const db = app.db;
  const roleRepo = db.getRepository('roles');
  if (!roleRepo) return 0;

  let created = 0;

  for (const roleDef of CRM_ROLES) {
    try {
      const existing = await roleRepo.findOne({ filter: { name: roleDef.name } });
      if (existing) continue;

      await roleRepo.create({
        values: {
          name: roleDef.name,
          title: roleDef.title,
          description: roleDef.description,
          hidden: false,
          strategy: { actions: Object.keys(roleDef.collections).flatMap((col) => roleDef.collections[col].map((act) => `${col}:${act}`)) },
        },
      });

      created++;
      app.logger.info(`[crm] Created role: ${roleDef.title}`);
    } catch (err) {
      app.logger.debug(`[crm] Role "${roleDef.name}" skipped: ${(err as any).message}`);
    }
  }

  return created;
}

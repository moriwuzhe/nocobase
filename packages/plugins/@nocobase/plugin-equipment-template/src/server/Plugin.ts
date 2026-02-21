/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedData } from './seed-data';
import { createTemplateUI } from './ui-schema-generator';
import { createEquipmentRoles } from './roles';
import { createEquipmentWorkflows } from './workflows';

const COLLECTIONS = ['eqEquipment', 'eqMaintenancePlans', 'eqMaintenanceRecords'];

export default class PluginEquipmentTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    // Skip heavy operations for sub-apps
    if (this.app.name && this.app.name !== 'main') return;
 try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[equipment] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[equipment] Seed skipped: ${(e as any).message}`); }
        try { const rc = await createEquipmentRoles(this.app); if (rc > 0) this.app.logger.info(`[equipment] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[equipment] Roles skipped: ${(e as any).message}`); }
try { const wf = await createEquipmentWorkflows(this.app); if (wf > 0) this.app.logger.info(`[equipment] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[equipment] Workflows skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '设备维保', 'ToolOutlined', [
      { title: '设备台账', icon: 'ToolOutlined', collectionName: 'eqEquipment', fields: ['assetCode','name','model','status','location','lastMaintenanceDate'], formFields: ['name','model','status','location','purchaseDate'] },
      { title: '维修工单', icon: 'FileTextOutlined', collectionName: 'eqWorkOrders', fields: ['title','type','priority','status','createdAt'], formFields: ['title','type','priority','description'] },
      { title: '备件管理', icon: 'InboxOutlined', collectionName: 'eqSpareParts', fields: ['name','partNo','quantity','minStock','unitPrice'], formFields: ['name','partNo','quantity','minStock','unitPrice'] },
    ]); } catch (e) { this.app.logger.warn(`[equipment] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('eqEquipment.beforeCreate', async (model: any) => {
      if (!model.get('assetCode')) {
        const count = await this.db.getRepository('eqEquipment').count();
        model.set('assetCode', `EQ${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('eqMaintenanceRecords.afterCreate', async (model: any, options: any) => {
      const equipmentId = model.get('equipmentId');
      if (!equipmentId) return;
      try {
        await this.db.getRepository('eqEquipment').update({
          filterByTk: equipmentId,
          values: {
            lastMaintenanceDate: model.get('date') || new Date(),
          },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });
  }
}

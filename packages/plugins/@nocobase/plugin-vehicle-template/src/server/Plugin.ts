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
import { createVehicleWorkflows } from './workflows';

const COLLECTIONS = ['vehicles', 'vehicleInsurance', 'vehicleMaintenance'];

export default class PluginVehicleTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[vehicle] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[vehicle] Seed skipped: ${(e as any).message}`); }
    try { const wf = await createVehicleWorkflows(this.app); if (wf > 0) this.app.logger.info(`[vehicle] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[vehicle] Workflows skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '车辆管理', 'CarOutlined', [
      { title: '车辆台账', icon: 'CarOutlined', collectionName: 'vehicles', fields: ['plateNumber','brand','model','status','department','insuranceExpiry'], formFields: ['plateNumber','brand','model','status','department','insuranceExpiry','nextInspectionDate'] },
      { title: '维保记录', icon: 'ToolOutlined', collectionName: 'vehicleMaintenance', fields: ['type','date','mileage','cost','description'], formFields: ['type','date','mileage','cost','description'] },
      { title: '用车日志', icon: 'FileTextOutlined', collectionName: 'vehicleUsageLogs', fields: ['date','driver','purpose','startMileage','endMileage'], formFields: ['date','driver','purpose','startMileage','endMileage'] },
    ]); } catch (e) { this.app.logger.warn(`[vehicle] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('vehicleMaintenance.afterCreate', async (model: any, options: any) => {
      const vehicleId = model.get('vehicleId');
      if (!vehicleId) return;
      try {
        await this.db.getRepository('vehicles').update({
          filterByTk: vehicleId,
          values: {
            lastMaintenanceDate: model.get('date') || new Date(),
            lastMileage: model.get('mileage'),
          },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });
  }
}

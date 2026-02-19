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

const COLLECTIONS = ['eqEquipment', 'eqMaintenancePlans', 'eqMaintenanceRecords'];

export default class PluginEquipmentTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[equipment] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[equipment] Seed skipped: ${(e as any).message}`); } }
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

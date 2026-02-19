/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const COLLECTIONS = ['vehicles', 'vehicleInsurance', 'vehicleMaintenance'];

export default class PluginVehicleTemplateServer extends Plugin {
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

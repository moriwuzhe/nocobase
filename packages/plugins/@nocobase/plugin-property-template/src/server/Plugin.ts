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

const COLLECTIONS = ['propOwners', 'propRepairRequests', 'propFees', 'propUnits'];

export default class PluginPropertyTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[property] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[property] Seed skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '物业管理', 'HomeOutlined', [{ title: '业主管理', icon: 'UserOutlined', collectionName: 'propOwners', fields: ['name','phone','unit','building','area','status'], formFields: ['name','phone','unit','building','area','status'] }, { title: '报修工单', icon: 'ToolOutlined', collectionName: 'propRepairRequests', fields: ['code','description','category','status','priority'], formFields: ['description','category','priority'] }]); } catch (e) { this.app.logger.warn(`[property] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('propRepairRequests.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const date = new Date();
        const count = await this.db.getRepository('propRepairRequests').count();
        model.set('code', `WX-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('propRepairRequests.beforeSave', async (model: any) => {
      if (model.get('status') === 'completed' && !model.get('completedAt')) {
        model.set('completedAt', new Date());
      }
    });

    this.db.on('propFees.beforeSave', async (model: any) => {
      if (model.get('status') === 'paid' && !model.get('paidAt')) {
        model.set('paidAt', new Date());
      }
    });
  }
}

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

const COLLECTIONS = ['serviceRequests', 'serviceWarranties', 'serviceReturns'];

export default class PluginServiceTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[service] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[service] Seed skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '售后服务', 'CustomerServiceOutlined', [{ title: '售后工单', icon: 'ToolOutlined', collectionName: 'serviceRequests', fields: ['code','title','type','status','priority','createdAt'], formFields: ['title','type','priority','description'] }]); } catch (e) { this.app.logger.warn(`[service] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('serviceRequests.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const date = new Date();
        const count = await this.db.getRepository('serviceRequests').count();
        model.set('code', `SR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('serviceRequests.beforeSave', async (model: any) => {
      if (model.get('status') === 'resolved' && !model.get('resolvedAt')) {
        model.set('resolvedAt', new Date());
      }
    });
  }
}

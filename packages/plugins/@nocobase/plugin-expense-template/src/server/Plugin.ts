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
import { createExpenseRoles } from './roles';
import { createExpenseWorkflows } from './workflows';

const COLLECTIONS = ['expenseClaims', 'expenseItems', 'expenseCategories'];

export default class PluginExpenseTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[expense] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[expense] Seed skipped: ${(e as any).message}`); }
    try { const rc = await createExpenseRoles(this.app); if (rc > 0) this.app.logger.info(`[expense] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[expense] Roles skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '报销管理', 'AccountBookOutlined', [{ title: '报销单', icon: 'AccountBookOutlined', collectionName: 'expenseClaims', fields: ['code','title','totalAmount','status','createdAt'], formFields: ['title','totalAmount','status'] }, { title: '费用类别', icon: 'TagOutlined', collectionName: 'expenseCategories', fields: ['name','code'], formFields: ['name','code'] }]); } catch (e) { this.app.logger.warn(`[expense] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('expenseClaims.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const date = new Date();
        const prefix = `BX-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await this.db.getRepository('expenseClaims').count();
        model.set('code', `${prefix}-${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('expenseItems.afterSave', async (model: any, options: any) => {
      const claimId = model.get('claimId');
      if (!claimId) return;
      try {
        const items = await this.db.getRepository('expenseItems').find({
          filter: { claimId },
          fields: ['amount'],
          transaction: options.transaction,
        });
        const totalAmount = items.reduce((s: number, i: any) => s + (i.amount || 0), 0);
        await this.db.getRepository('expenseClaims').update({
          filterByTk: claimId,
          values: { totalAmount },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });

    this.db.on('expenseClaims.beforeSave', async (model: any) => {
      if (model.get('status') === 'approved' && !model.get('approvedAt')) {
        model.set('approvedAt', new Date());
      }
      if (model.get('status') === 'paid' && !model.get('paidAt')) {
        model.set('paidAt', new Date());
      }
    });
  }
}

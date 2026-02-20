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
import { createProcurementWorkflows } from './workflows';

const COLLECTIONS = [
  'procPurchaseOrders',
  'procOrderItems',
  'procSuppliers',
  'procReceiving',
  'procPayments',
];

export default class PluginProcurementTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[procurement] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[procurement] Seed skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '采购管理', 'ShoppingCartOutlined', [{ title: '采购订单', icon: 'ShoppingCartOutlined', collectionName: 'procPurchaseOrders', fields: ['code','title','totalAmount','status','createdAt'], formFields: ['title','totalAmount','status'] }, { title: '供应商', icon: 'ShopOutlined', collectionName: 'procSuppliers', fields: ['name','contactPerson','phone','email','category','rating'], formFields: ['name','contactPerson','phone','email','category','rating'] }]); } catch (e) { this.app.logger.warn(`[procurement] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('procPurchaseOrders.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const date = new Date();
        const prefix = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await this.db.getRepository('procPurchaseOrders').count();
        model.set('code', `${prefix}-${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('procOrderItems.afterSave', async (model: any, options: any) => {
      const orderId = model.get('orderId');
      if (!orderId) return;
      try {
        const items = await this.db.getRepository('procOrderItems').find({
          filter: { orderId },
          fields: ['amount', 'quantity', 'unitPrice'],
          transaction: options.transaction,
        });
        const totalAmount = items.reduce(
          (s: number, i: any) => s + ((i.quantity || 0) * (i.unitPrice || 0)),
          0,
        );
        await this.db.getRepository('procPurchaseOrders').update({
          filterByTk: orderId,
          values: { totalAmount },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });

    this.db.on('procPurchaseOrders.beforeSave', async (model: any) => {
      if (model.get('status') === 'approved' && !model.get('approvedAt')) {
        model.set('approvedAt', new Date());
      }
      if (model.get('status') === 'received' && !model.get('receivedAt')) {
        model.set('receivedAt', new Date());
      }
    });
  }
}

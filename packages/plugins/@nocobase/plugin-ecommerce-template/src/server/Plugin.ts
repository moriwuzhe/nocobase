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
import { createEcommerceRoles } from './roles';
import { createEcommerceWorkflows } from './workflows';

const COLLECTIONS = ['ecOrders', 'ecOrderItems', 'ecProducts', 'ecCategories', 'ecShipping', 'ecRefunds'];

export default class PluginEcommerceTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    // Skip heavy operations for sub-apps
    if (this.app.name && this.app.name !== 'main') return;
 try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[ecommerce] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[ecommerce] Seed skipped: ${(e as any).message}`); }
        try { const rc = await createEcommerceRoles(this.app); if (rc > 0) this.app.logger.info(`[ecommerce] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[ecommerce] Roles skipped: ${(e as any).message}`); }
try { const wf = await createEcommerceWorkflows(this.app); if (wf > 0) this.app.logger.info(`[ecommerce] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[ecommerce] Workflows skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '电商订单', 'ShopOutlined', [
      { title: '订单管理', icon: 'ShoppingOutlined', collectionName: 'ecOrders', fields: ['orderNo','totalAmount','status','paymentMethod','createdAt'], formFields: ['totalAmount','status','paymentMethod'] },
      { title: '商品管理', icon: 'GiftOutlined', collectionName: 'ecProducts', fields: ['name','price','category','stock','status'], formFields: ['name','price','category','stock','status','description'] },
      { title: '退款管理', icon: 'RollbackOutlined', collectionName: 'ecRefunds', fields: ['reason','amount','status','createdAt'], formFields: ['reason','amount','status'] },
    ]); } catch (e) { this.app.logger.warn(`[ecommerce] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('ecOrders.beforeCreate', async (model: any) => {
      if (!model.get('orderNo')) {
        const date = new Date();
        const ts = date.getTime().toString(36).toUpperCase();
        const count = await this.db.getRepository('ecOrders').count();
        model.set('orderNo', `EC${date.getFullYear()}${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('ecOrders.beforeSave', async (model: any) => {
      if (model.get('status') === 'paid' && !model.get('paidAt')) {
        model.set('paidAt', new Date());
      }
      if (model.get('status') === 'shipped' && !model.get('shippedAt')) {
        model.set('shippedAt', new Date());
      }
      if (model.get('status') === 'completed' && !model.get('completedAt')) {
        model.set('completedAt', new Date());
      }
    });
  }
}

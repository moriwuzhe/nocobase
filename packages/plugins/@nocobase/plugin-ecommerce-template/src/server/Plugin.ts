/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const COLLECTIONS = ['ecOrders', 'ecOrderItems', 'ecProducts', 'ecCategories', 'ecShipping', 'ecRefunds'];

export default class PluginEcommerceTemplateServer extends Plugin {
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

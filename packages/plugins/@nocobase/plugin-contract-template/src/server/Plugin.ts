/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const COLLECTIONS = ['contracts', 'contractPayments', 'contractTemplates'];

export default class PluginContractTemplateServer extends Plugin {
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('contracts.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const year = new Date().getFullYear();
        const count = await this.db.getRepository('contracts').count();
        model.set('code', `HT-${year}-${String(count + 1).padStart(4, '0')}`);
      }
    });

    this.db.on('contracts.beforeSave', async (model: any) => {
      const status = model.get('status');
      if (status === 'signed' && !model.get('signedAt')) {
        model.set('signedAt', new Date());
      }
    });

    this.db.on('contractPayments.afterSave', async (model: any, options: any) => {
      const contractId = model.get('contractId');
      if (!contractId) return;
      try {
        const payments = await this.db.getRepository('contractPayments').find({
          filter: { contractId, status: 'paid' },
          fields: ['amount'],
          transaction: options.transaction,
        });
        const paidAmount = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
        await this.db.getRepository('contracts').update({
          filterByTk: contractId,
          values: { paidAmount },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });
  }
}

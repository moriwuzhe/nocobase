/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const COLLECTIONS = ['members', 'memberCards', 'memberPointsLog'];

export default class PluginMembershipTemplateServer extends Plugin {
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('members.beforeCreate', async (model: any) => {
      if (!model.get('memberNo')) {
        const count = await this.db.getRepository('members').count();
        model.set('memberNo', `M${String(count + 1).padStart(8, '0')}`);
      }
    });

    this.db.on('memberPointsLog.afterCreate', async (model: any, options: any) => {
      const memberId = model.get('memberId');
      if (!memberId) return;
      try {
        const logs = await this.db.getRepository('memberPointsLog').find({
          filter: { memberId },
          fields: ['points', 'type'],
          transaction: options.transaction,
        });
        const totalPoints = logs.reduce((s: number, l: any) => {
          return s + (l.type === 'earn' ? (l.points || 0) : -(l.points || 0));
        }, 0);
        await this.db.getRepository('members').update({
          filterByTk: memberId,
          values: { points: Math.max(totalPoints, 0) },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });
  }
}

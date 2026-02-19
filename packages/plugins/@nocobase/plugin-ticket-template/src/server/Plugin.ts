/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const COLLECTIONS = ['tickets', 'ticketKnowledgeBase', 'ticketCategories', 'ticketReplies'];

export default class PluginTicketTemplateServer extends Plugin {
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('tickets.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const date = new Date();
        const prefix = `GD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await this.db.getRepository('tickets').count();
        model.set('code', `${prefix}-${String(count + 1).padStart(5, '0')}`);
      }
    });

    this.db.on('tickets.beforeSave', async (model: any) => {
      const status = model.get('status');
      if (status === 'resolved' && !model.get('resolvedAt')) {
        model.set('resolvedAt', new Date());
        if (model.get('createdAt')) {
          const created = new Date(model.get('createdAt'));
          const resolved = new Date();
          const hours = Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60) * 10) / 10;
          model.set('resolutionHours', hours);
        }
      }
      if (status === 'closed' && !model.get('closedAt')) {
        model.set('closedAt', new Date());
      }
    });

    this.db.on('ticketReplies.afterCreate', async (model: any, options: any) => {
      const ticketId = model.get('ticketId');
      if (ticketId) {
        try {
          const ticket = await this.db.getRepository('tickets').findOne({
            filterByTk: ticketId,
            transaction: options.transaction,
          });
          if (ticket && ticket.get('status') === 'open') {
            await this.db.getRepository('tickets').update({
              filterByTk: ticketId,
              values: { status: 'in_progress', lastRepliedAt: new Date() },
              transaction: options.transaction,
            });
          } else if (ticket) {
            await this.db.getRepository('tickets').update({
              filterByTk: ticketId,
              values: { lastRepliedAt: new Date() },
              transaction: options.transaction,
            });
          }
        } catch { /* non-critical */ }
      }
    });
  }
}

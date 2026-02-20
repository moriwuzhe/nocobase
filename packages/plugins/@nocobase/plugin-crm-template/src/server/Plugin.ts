/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedCrmData } from './seed-data';
import { createTemplateUI } from './ui-schema-generator';

const CRM_COLLECTIONS = [
  'crmLeads',
  'crmCustomers',
  'crmContacts',
  'crmDeals',
  'crmActivities',
  'crmProducts',
  'crmQuotes',
  'crmQuoteItems',
  'crmCampaigns',
  'crmContracts',
  'crmPayments',
  'crmCompetitors',
  'crmSalesTargets',
  'crmEmailTemplates',
];

const STAGE_PROBABILITY: Record<string, number> = {
  qualification: 10,
  needs_analysis: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
};

export default class PluginCrmTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    try {
      const result = await seedCrmData(this.db);
      if (result.created > 0) {
        this.app.logger.info(`[crm-template] Seeded ${result.created} sample records`);
      }
    } catch (err) {
      this.app.logger.warn(`[crm-template] Seed data skipped: ${err.message}`);
    }

    try {
      await createTemplateUI(this.app, '客户管理 CRM', 'TeamOutlined', [
        { title: '客户', icon: 'TeamOutlined', collectionName: 'crmCustomers', fields: ['name', 'code', 'industry', 'stage', 'rating', 'phone', 'email', 'province', 'city'], formFields: ['name', 'industry', 'size', 'stage', 'rating', 'source', 'phone', 'email', 'website', 'province', 'city', 'address', 'annualRevenue', 'notes'] },
        { title: '联系人', icon: 'UserOutlined', collectionName: 'crmContacts', fields: ['name', 'phone', 'email', 'position', 'department'], formFields: ['name', 'phone', 'email', 'position', 'department'] },
        { title: '商机', icon: 'DollarOutlined', collectionName: 'crmDeals', fields: ['name', 'code', 'amount', 'stage', 'probability', 'expectedCloseDate'], formFields: ['name', 'amount', 'currency', 'stage', 'probability', 'expectedCloseDate', 'notes'] },
        { title: '跟进活动', icon: 'PhoneOutlined', collectionName: 'crmActivities', fields: ['type', 'subject', 'activityDate', 'content'], formFields: ['type', 'subject', 'activityDate', 'content'] },
        { title: '线索', icon: 'FlagOutlined', collectionName: 'crmLeads', fields: ['name', 'company', 'phone', 'email', 'source', 'status'], formFields: ['name', 'company', 'phone', 'email', 'source', 'status'] },
        { title: '产品', icon: 'ShoppingOutlined', collectionName: 'crmProducts', fields: ['name', 'code', 'price', 'category', 'status'], formFields: ['name', 'code', 'price', 'category', 'description', 'status'] },
      ]);
    } catch (err) {
      this.app.logger.warn(`[crm-template] UI creation skipped: ${(err as any).message}`);
    }
  }

  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: CRM_COLLECTIONS.map((c) => `${c}:*`),
    });
    for (const c of CRM_COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }

    this.registerCustomActions();
    this.registerHooks();
  }

  private registerCustomActions() {
    this.app.resourceManager.define({
      name: 'crmDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const [customers, deals, contacts, activities] = await Promise.all([
            db.getRepository('crmCustomers').count(),
            db.getRepository('crmDeals').find({ fields: ['stage', 'amount', 'weightedAmount'] }),
            db.getRepository('crmContacts').count(),
            db.getRepository('crmActivities').count(),
          ]);

          const dealsList = deals || [];
          const openDeals = dealsList.filter(
            (d: any) => !['closed_won', 'closed_lost'].includes(d.stage),
          );
          const wonDeals = dealsList.filter((d: any) => d.stage === 'closed_won');
          const lostDeals = dealsList.filter((d: any) => d.stage === 'closed_lost');

          const totalPipeline = openDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
          const totalWon = wonDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
          const weightedPipeline = openDeals.reduce(
            (sum: number, d: any) => sum + (d.weightedAmount || 0),
            0,
          );

          const winRate =
            wonDeals.length + lostDeals.length > 0
              ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
              : 0;

          const stageBreakdown: Record<string, { count: number; amount: number }> = {};
          for (const deal of dealsList) {
            const d = deal.toJSON ? deal.toJSON() : deal;
            if (!stageBreakdown[d.stage]) {
              stageBreakdown[d.stage] = { count: 0, amount: 0 };
            }
            stageBreakdown[d.stage].count++;
            stageBreakdown[d.stage].amount += d.amount || 0;
          }

          ctx.body = {
            totalCustomers: customers,
            totalContacts: contacts,
            totalDeals: dealsList.length,
            totalActivities: activities,
            openDeals: openDeals.length,
            wonDeals: wonDeals.length,
            lostDeals: lostDeals.length,
            totalPipeline,
            totalWon,
            weightedPipeline,
            winRate,
            stageBreakdown,
          };
          await next();
        },
      },
    });

    this.app.acl.allow('crmDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('crmDeals.beforeSave', async (model: any) => {
      const amount = model.get('amount') || 0;
      const stage = model.get('stage');
      const probability =
        model.get('probability') ?? STAGE_PROBABILITY[stage] ?? 20;

      if (model.changed('stage') && !model.changed('probability')) {
        const defaultProb = STAGE_PROBABILITY[stage];
        if (defaultProb !== undefined) {
          model.set('probability', defaultProb);
        }
      }

      model.set('weightedAmount', Math.round(amount * (probability / 100) * 100) / 100);

      if (stage === 'closed_won' && !model.get('actualCloseDate')) {
        model.set('actualCloseDate', new Date());
      }
      if (stage === 'closed_lost' && !model.get('actualCloseDate')) {
        model.set('actualCloseDate', new Date());
      }
    });

    this.db.on('crmCustomers.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const count = await this.db.getRepository('crmCustomers').count();
        model.set('code', `C${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('crmDeals.beforeCreate', async (model: any) => {
      if (!model.get('code')) {
        const count = await this.db.getRepository('crmDeals').count();
        model.set('code', `D${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('crmActivities.afterCreate', async (model: any, options: any) => {
      const customerId = model.get('customerId');
      if (customerId) {
        try {
          await this.db.getRepository('crmCustomers').update({
            filterByTk: customerId,
            values: { lastContactedAt: new Date() },
            transaction: options.transaction,
          });
        } catch {
          // non-critical, ignore
        }
      }
    });
  }
}

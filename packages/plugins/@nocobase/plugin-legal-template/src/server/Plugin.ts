/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
import { createLegalRoles } from './roles';
import { createLegalWorkflows } from './workflows';
const COLLECTIONS = ['legalCases', 'legalDocuments'];
const DASHBOARD_ACTION = 'legalDashboard:stats';
export default class PluginLegalTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try {
      if ((await this.db.getRepository('legalCases').count()) === 0) {
        await this.db.getRepository('legalCases').create({
          values: {
            title: '张某 vs 李某 借款纠纷',
            caseType: 'civil',
            status: 'open',
            priority: 'high',
            lawyer: '王律师',
            client: '张某',
            opponent: '李某',
            court: '北京市海淀区人民法院',
            claimAmount: 500000,
          },
        });
        await this.db.getRepository('legalCases').create({
          values: {
            title: '某科技公司知识产权侵权案',
            caseType: 'ip',
            status: 'trial',
            priority: 'urgent',
            lawyer: '刘律师',
            client: '某科技公司',
            opponent: '某竞争公司',
            court: '北京知识产权法院',
            claimAmount: 2000000,
          },
        });
      }
    } catch (e) {
      this.app.logger.warn(`[legal] Seed skipped: ${(e as any).message}`);
    }

    try {
      const roleCount = await createLegalRoles(this.app);
      if (roleCount > 0) this.app.logger.info(`[legal] Created ${roleCount} roles`);
    } catch (e) {
      this.app.logger.warn(`[legal] Roles skipped: ${(e as any).message}`);
    }

    try {
      const workflowCount = await createLegalWorkflows(this.app);
      if (workflowCount > 0) this.app.logger.info(`[legal] Created ${workflowCount} workflows`);
    } catch (e) {
      this.app.logger.warn(`[legal] Workflows skipped: ${(e as any).message}`);
    }

    try {
      await createTemplateUI(this.app, '法务管理', 'AuditOutlined', [
        {
          title: '案件管理',
          icon: 'AuditOutlined',
          collectionName: 'legalCases',
          fields: ['caseNo', 'title', 'caseType', 'status', 'priority', 'lawyer', 'client', 'opponent', 'claimAmount'],
          formFields: [
            'title',
            'caseType',
            'status',
            'priority',
            'lawyer',
            'client',
            'opponent',
            'court',
            'claimAmount',
            'filingDate',
            'trialDate',
            'description',
          ],
        },
        {
          title: '法律文书',
          icon: 'FileTextOutlined',
          collectionName: 'legalDocuments',
          fields: ['title', 'docType', 'status', 'author', 'reviewer'],
          formFields: ['title', 'docType', 'status', 'content', 'author', 'reviewer'],
        },
      ]);
    } catch (e) {
      this.app.logger.warn(`[legal] UI skipped: ${(e as any).message}`);
    }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: [...COLLECTIONS.map((c) => `${c}:*`), DASHBOARD_ACTION],
    });

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'legalDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const [cases, docs] = await Promise.all([
            ctx.db.getRepository('legalCases').find({
              fields: ['status', 'priority'],
            }),
            ctx.db.getRepository('legalDocuments').find({
              fields: ['status'],
            }),
          ]);

          const caseList = (cases || []).map((item: any) => (item.toJSON ? item.toJSON() : item));
          const docList = (docs || []).map((item: any) => (item.toJSON ? item.toJSON() : item));

          ctx.body = {
            totalCases: caseList.length,
            openCases: caseList.filter((item: any) => item.status === 'open').length,
            trialCases: caseList.filter((item: any) => item.status === 'trial').length,
            closedCases: caseList.filter((item: any) => item.status === 'closed').length,
            urgentCases: caseList.filter(
              (item: any) => ['high', 'urgent'].includes(item.priority) && item.status !== 'closed',
            ).length,
            totalDocuments: docList.length,
            reviewDocuments: docList.filter((item: any) => item.status === 'review').length,
            finalizedDocuments: docList.filter((item: any) => item.status === 'finalized').length,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('legalDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('legalCases.beforeCreate', async (model: any) => {
      if (!model.get('caseNo')) {
        const c = await this.db.getRepository('legalCases').count();
        model.set('caseNo', `CASE-${new Date().getFullYear()}-${String(c + 1).padStart(4, '0')}`);
      }
    });
  }
}

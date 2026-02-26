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
import { createRecruitmentRoles } from './roles';
import { createRecruitmentWorkflows } from './workflows';

const COLLECTIONS = ['recJobPostings', 'recCandidates', 'recInterviews', 'recOffers'];

export default class PluginRecruitmentTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    // Skip heavy operations for sub-apps
    if (this.app.name && this.app.name !== 'main') return;
 try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[recruitment] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[recruitment] Seed skipped: ${(e as any).message}`); }
        try { const rc = await createRecruitmentRoles(this.app); if (rc > 0) this.app.logger.info(`[recruitment] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[recruitment] Roles skipped: ${(e as any).message}`); }
try { const wf = await createRecruitmentWorkflows(this.app); if (wf > 0) this.app.logger.info(`[recruitment] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[recruitment] Workflows skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '招聘管理', 'SolutionOutlined', [
      { title: '职位发布', icon: 'SolutionOutlined', collectionName: 'recJobPostings', fields: ['title','department','location','status','headcount'], formFields: ['title','department','location','status','headcount','description'] },
      { title: '候选人', icon: 'UserAddOutlined', collectionName: 'recCandidates', fields: ['name','phone','email','stage','source'], formFields: ['name','phone','email','stage','source'] },
      { title: '面试记录', icon: 'CalendarOutlined', collectionName: 'recInterviews', fields: ['interviewer','round','result','feedback'], formFields: ['interviewer','round','result','feedback'] },
      { title: 'Offer管理', icon: 'FileProtectOutlined', collectionName: 'recOffers', fields: ['salary','startDate','status','expiryDate'], formFields: ['salary','startDate','status','expiryDate'] },
    ]); } catch (e) { this.app.logger.warn(`[recruitment] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('recCandidates.beforeSave', async (model: any) => {
      if (model.get('stage') === 'hired' && !model.get('hiredAt')) {
        model.set('hiredAt', new Date());
      }
      if (model.get('stage') === 'rejected' && !model.get('rejectedAt')) {
        model.set('rejectedAt', new Date());
      }
    });

    this.db.on('recJobPostings.beforeSave', async (model: any) => {
      if (model.get('status') === 'published' && !model.get('publishedAt')) {
        model.set('publishedAt', new Date());
      }
      if (model.get('status') === 'closed' && !model.get('closedAt')) {
        model.set('closedAt', new Date());
      }
    });
  }
}

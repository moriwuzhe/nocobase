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

const COLLECTIONS = ['recJobPostings', 'recCandidates', 'recInterviews', 'recOffers'];

export default class PluginRecruitmentTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[recruitment] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[recruitment] Seed skipped: ${(e as any).message}`); } }
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

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

const COLLECTIONS = ['eduStudents', 'eduCourses', 'eduGrades', 'eduEnrollments', 'eduTeachers'];

export default class PluginEducationTemplateServer extends Plugin {
  async install(options?: InstallOptions) { try { const r = await seedData(this.db); if (r.created > 0) this.app.logger.info(`[education] Seeded ${r.created} records`); } catch (e) { this.app.logger.warn(`[education] Seed skipped: ${(e as any).message}`); } }
  async load() {
    for (const c of COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });

    this.db.on('eduStudents.beforeCreate', async (model: any) => {
      if (!model.get('studentId')) {
        const year = new Date().getFullYear();
        const count = await this.db.getRepository('eduStudents').count();
        model.set('studentId', `${year}${String(count + 1).padStart(5, '0')}`);
      }
    });

    this.db.on('eduGrades.afterSave', async (model: any, options: any) => {
      const studentId = model.get('studentId');
      const courseId = model.get('courseId');
      if (!studentId || !courseId) return;
      try {
        const grades = await this.db.getRepository('eduGrades').find({
          filter: { studentId },
          fields: ['score'],
          transaction: options.transaction,
        });
        const scores = grades.map((g: any) => g.score).filter((s: any) => s != null);
        const avgScore = scores.length
          ? Math.round((scores.reduce((s: number, v: number) => s + v, 0) / scores.length) * 100) / 100
          : null;
        await this.db.getRepository('eduStudents').update({
          filterByTk: studentId,
          values: { avgScore },
          transaction: options.transaction,
        });
      } catch { /* non-critical */ }
    });
  }
}

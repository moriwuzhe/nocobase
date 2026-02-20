import { uid } from '@nocobase/utils';
export async function createProjectRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  const roles = [
    { name: 'pm-manager', title: '项目管理员', collections: { pmProjects: ['list','get','create','update','destroy'], pmTasks: ['list','get','create','update','destroy'], pmMilestones: ['list','get','create','update','destroy'], pmTimesheets: ['list','get','create','update','destroy'], pmRisks: ['list','get','create','update','destroy'] } },
    { name: 'pm-member', title: '项目成员', collections: { pmProjects: ['list','get'], pmTasks: ['list','get','create','update'], pmTimesheets: ['list','get','create'], pmMilestones: ['list','get'] } },
  ];
  for (const r of roles) {
    try {
      if (await roleRepo.findOne({ filter: { name: r.name } })) continue;
      await roleRepo.create({ values: { name: r.name, title: r.title, hidden: false, strategy: { actions: Object.keys(r.collections).flatMap(col => (r.collections as any)[col].map((a: string) => `${col}:${a}`)) } } });
      created++;
    } catch (e) { app.logger.debug(`[project] Role skipped: ${(e as any).message}`); }
  }
  return created;
}

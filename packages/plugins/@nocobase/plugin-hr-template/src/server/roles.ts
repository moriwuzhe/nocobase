export async function createHrRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  const roles = [
    { name: 'hr-admin', title: 'HR 管理员', collections: { hrEmployees: ['list','get','create','update','destroy'], hrLeaveRequests: ['list','get','create','update','destroy'], hrAttendance: ['list','get','create','update','destroy'], hrTraining: ['list','get','create','update','destroy'], hrPerformance: ['list','get','create','update','destroy'], hrSalary: ['list','get','create','update'], hrOnboarding: ['list','get','create','update','destroy'] } },
    { name: 'hr-employee', title: '普通员工', collections: { hrEmployees: ['list','get'], hrLeaveRequests: ['list','get','create'], hrAttendance: ['list','get'], hrTraining: ['list','get'] } },
  ];
  for (const r of roles) {
    try {
      if (await roleRepo.findOne({ filter: { name: r.name } })) continue;
      await roleRepo.create({ values: { name: r.name, title: r.title, hidden: false, strategy: { actions: Object.keys(r.collections).flatMap(col => (r.collections as any)[col].map((a: string) => `${col}:${a}`)) } } });
      created++;
    } catch (e) { app.logger.debug(`[hr] Role skipped: ${(e as any).message}`); }
  }
  return created;
}

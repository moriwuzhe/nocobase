export async function createEducationRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'edu-admin' } }))) { await roleRepo.create({ values: { name: 'edu-admin', title: '教务管理员', hidden: false, strategy: { actions: ['eduStudents:list', 'eduStudents:get', 'eduStudents:create', 'eduStudents:update', 'eduStudents:destroy', 'eduCourses:list', 'eduCourses:get', 'eduCourses:create', 'eduCourses:update', 'eduCourses:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[education] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'edu-teacher' } }))) { await roleRepo.create({ values: { name: 'edu-teacher', title: '教师', hidden: false, strategy: { actions: ['eduStudents:list', 'eduStudents:get', 'eduCourses:list', 'eduCourses:get', 'eduCourses:update'] } } }); created++; } } catch (e) { app.logger.debug(`[education] Role skipped: ${(e as any).message}`); }
  return created;
}

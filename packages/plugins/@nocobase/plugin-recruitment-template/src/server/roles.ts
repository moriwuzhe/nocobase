export async function createRecruitmentRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'rec-admin' } }))) { await roleRepo.create({ values: { name: 'rec-admin', title: '招聘管理员', hidden: false, strategy: { actions: ['recJobPostings:list', 'recJobPostings:get', 'recJobPostings:create', 'recJobPostings:update', 'recJobPostings:destroy', 'recCandidates:list', 'recCandidates:get', 'recCandidates:create', 'recCandidates:update', 'recCandidates:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[recruitment] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'rec-interviewer' } }))) { await roleRepo.create({ values: { name: 'rec-interviewer', title: '面试官', hidden: false, strategy: { actions: ['recJobPostings:list', 'recJobPostings:get', 'recCandidates:list', 'recCandidates:get', 'recCandidates:update'] } } }); created++; } } catch (e) { app.logger.debug(`[recruitment] Role skipped: ${(e as any).message}`); }
  return created;
}

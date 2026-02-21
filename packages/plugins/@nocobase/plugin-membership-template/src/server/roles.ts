export async function createMembershipRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'mem-admin' } }))) { await roleRepo.create({ values: { name: 'mem-admin', title: '会员管理员', hidden: false, strategy: { actions: ['members:list', 'members:get', 'members:create', 'members:update', 'members:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[membership] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'mem-viewer' } }))) { await roleRepo.create({ values: { name: 'mem-viewer', title: '会员查看', hidden: false, strategy: { actions: ['members:list', 'members:get'] } } }); created++; } } catch (e) { app.logger.debug(`[membership] Role skipped: ${(e as any).message}`); }
  return created;
}

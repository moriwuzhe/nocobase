export async function createServiceRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'svc-admin' } }))) { await roleRepo.create({ values: { name: 'svc-admin', title: '售后管理员', hidden: false, strategy: { actions: ['serviceRequests:list', 'serviceRequests:get', 'serviceRequests:create', 'serviceRequests:update', 'serviceRequests:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[service] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'svc-agent' } }))) { await roleRepo.create({ values: { name: 'svc-agent', title: '售后客服', hidden: false, strategy: { actions: ['serviceRequests:list', 'serviceRequests:get', 'serviceRequests:create', 'serviceRequests:update'] } } }); created++; } } catch (e) { app.logger.debug(`[service] Role skipped: ${(e as any).message}`); }
  return created;
}

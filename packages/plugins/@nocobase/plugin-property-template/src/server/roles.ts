export async function createPropertyRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'prop-admin' } }))) { await roleRepo.create({ values: { name: 'prop-admin', title: '物业管理员', hidden: false, strategy: { actions: ['propOwners:list', 'propOwners:get', 'propOwners:create', 'propOwners:update', 'propOwners:destroy', 'propRepairRequests:list', 'propRepairRequests:get', 'propRepairRequests:create', 'propRepairRequests:update', 'propRepairRequests:destroy', 'propFees:list', 'propFees:get', 'propFees:create', 'propFees:update', 'propFees:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[property] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'prop-staff' } }))) { await roleRepo.create({ values: { name: 'prop-staff', title: '物业员工', hidden: false, strategy: { actions: ['propOwners:list', 'propOwners:get', 'propRepairRequests:list', 'propRepairRequests:get', 'propRepairRequests:update', 'propFees:list', 'propFees:get'] } } }); created++; } } catch (e) { app.logger.debug(`[property] Role skipped: ${(e as any).message}`); }
  return created;
}

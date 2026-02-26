export async function createEquipmentRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'eq-admin' } }))) { await roleRepo.create({ values: { name: 'eq-admin', title: '设备管理员', hidden: false, strategy: { actions: ['eqEquipment:list', 'eqEquipment:get', 'eqEquipment:create', 'eqEquipment:update', 'eqEquipment:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[equipment] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'eq-technician' } }))) { await roleRepo.create({ values: { name: 'eq-technician', title: '技术员', hidden: false, strategy: { actions: ['eqEquipment:list', 'eqEquipment:get', 'eqEquipment:update'] } } }); created++; } } catch (e) { app.logger.debug(`[equipment] Role skipped: ${(e as any).message}`); }
  return created;
}

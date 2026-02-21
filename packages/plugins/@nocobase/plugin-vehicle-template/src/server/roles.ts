export async function createVehicleRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'veh-admin' } }))) { await roleRepo.create({ values: { name: 'veh-admin', title: '车辆管理员', hidden: false, strategy: { actions: ['vehicles:list', 'vehicles:get', 'vehicles:create', 'vehicles:update', 'vehicles:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[vehicle] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'veh-driver' } }))) { await roleRepo.create({ values: { name: 'veh-driver', title: '驾驶员', hidden: false, strategy: { actions: ['vehicles:list', 'vehicles:get'] } } }); created++; } } catch (e) { app.logger.debug(`[vehicle] Role skipped: ${(e as any).message}`); }
  return created;
}

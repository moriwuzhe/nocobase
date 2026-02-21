export async function createEcommerceRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'ec-admin' } }))) { await roleRepo.create({ values: { name: 'ec-admin', title: '电商管理员', hidden: false, strategy: { actions: ['ecOrders:list', 'ecOrders:get', 'ecOrders:create', 'ecOrders:update', 'ecOrders:destroy', 'ecProducts:list', 'ecProducts:get', 'ecProducts:create', 'ecProducts:update', 'ecProducts:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[ecommerce] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'ec-operator' } }))) { await roleRepo.create({ values: { name: 'ec-operator', title: '电商运营', hidden: false, strategy: { actions: ['ecOrders:list', 'ecOrders:get', 'ecOrders:update', 'ecProducts:list', 'ecProducts:get', 'ecProducts:update'] } } }); created++; } } catch (e) { app.logger.debug(`[ecommerce] Role skipped: ${(e as any).message}`); }
  return created;
}

export async function createProcurementRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'proc-admin' } }))) { await roleRepo.create({ values: { name: 'proc-admin', title: '采购管理员', hidden: false, strategy: { actions: ['procPurchaseOrders:list', 'procPurchaseOrders:get', 'procPurchaseOrders:create', 'procPurchaseOrders:update', 'procPurchaseOrders:destroy', 'procSuppliers:list', 'procSuppliers:get', 'procSuppliers:create', 'procSuppliers:update', 'procSuppliers:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[procurement] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'proc-buyer' } }))) { await roleRepo.create({ values: { name: 'proc-buyer', title: '采购员', hidden: false, strategy: { actions: ['procPurchaseOrders:list', 'procPurchaseOrders:get', 'procPurchaseOrders:create', 'procPurchaseOrders:update', 'procSuppliers:list', 'procSuppliers:get'] } } }); created++; } } catch (e) { app.logger.debug(`[procurement] Role skipped: ${(e as any).message}`); }
  return created;
}

export async function createInventoryRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'inv-admin' } }))) {
      await roleRepo.create({ values: { name: 'inv-admin', title: '库存管理员', hidden: false, strategy: { actions: ["invProducts:list", "invProducts:get", "invProducts:create", "invProducts:update", "invProducts:destroy", "invStockMovements:list", "invStockMovements:get", "invStockMovements:create", "invStockMovements:update", "invStockMovements:destroy", "invWarehouses:list", "invWarehouses:get", "invWarehouses:create", "invWarehouses:update", "invWarehouses:destroy", "invStockCheck:list", "invStockCheck:get", "invStockCheck:create", "invStockCheck:update", "invStockCheck:destroy"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[inventory] Role skipped: ${(e as any).message}`); }
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'inv-operator' } }))) {
      await roleRepo.create({ values: { name: 'inv-operator', title: '仓库操作员', hidden: false, strategy: { actions: ["invProducts:list", "invProducts:get", "invStockMovements:list", "invStockMovements:get", "invStockMovements:create", "invWarehouses:list", "invWarehouses:get", "invStockCheck:list", "invStockCheck:get", "invStockCheck:create"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[inventory] Role skipped: ${(e as any).message}`); }
  return created;
}

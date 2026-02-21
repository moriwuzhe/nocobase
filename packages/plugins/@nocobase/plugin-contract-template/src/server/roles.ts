export async function createContractRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'contract-admin' } }))) { await roleRepo.create({ values: { name: 'contract-admin', title: '合同管理员', hidden: false, strategy: { actions: ['contracts:list', 'contracts:get', 'contracts:create', 'contracts:update', 'contracts:destroy', 'contractPayments:list', 'contractPayments:get', 'contractPayments:create', 'contractPayments:update', 'contractPayments:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[contract] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'contract-viewer' } }))) { await roleRepo.create({ values: { name: 'contract-viewer', title: '合同查看者', hidden: false, strategy: { actions: ['contracts:list', 'contracts:get', 'contractPayments:list', 'contractPayments:get'] } } }); created++; } } catch (e) { app.logger.debug(`[contract] Role skipped: ${(e as any).message}`); }
  return created;
}

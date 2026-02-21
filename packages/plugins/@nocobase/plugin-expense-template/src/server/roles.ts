export async function createExpenseRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try { if (!(await roleRepo.findOne({ filter: { name: 'expense-admin' } }))) { await roleRepo.create({ values: { name: 'expense-admin', title: '报销管理员', hidden: false, strategy: { actions: ['expenseClaims:list', 'expenseClaims:get', 'expenseClaims:create', 'expenseClaims:update', 'expenseClaims:destroy', 'expenseItems:list', 'expenseItems:get', 'expenseItems:create', 'expenseItems:update', 'expenseItems:destroy'] } } }); created++; } } catch (e) { app.logger.debug(`[expense] Role skipped: ${(e as any).message}`); }
  try { if (!(await roleRepo.findOne({ filter: { name: 'expense-user' } }))) { await roleRepo.create({ values: { name: 'expense-user', title: '报销申请人', hidden: false, strategy: { actions: ['expenseClaims:list', 'expenseClaims:get', 'expenseClaims:create', 'expenseItems:list', 'expenseItems:get', 'expenseItems:create'] } } }); created++; } } catch (e) { app.logger.debug(`[expense] Role skipped: ${(e as any).message}`); }
  return created;
}

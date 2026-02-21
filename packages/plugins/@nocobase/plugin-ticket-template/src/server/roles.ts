export async function createTicketRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'ticket-admin' } }))) {
      await roleRepo.create({ values: { name: 'ticket-admin', title: '工单管理员', hidden: false, strategy: { actions: ["tickets:list", "tickets:get", "tickets:create", "tickets:update", "tickets:destroy", "ticketKnowledgeBase:list", "ticketKnowledgeBase:get", "ticketKnowledgeBase:create", "ticketKnowledgeBase:update", "ticketKnowledgeBase:destroy"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[ticket] Role skipped: ${(e as any).message}`); }
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'ticket-agent' } }))) {
      await roleRepo.create({ values: { name: 'ticket-agent', title: '工单处理员', hidden: false, strategy: { actions: ["tickets:list", "tickets:get", "tickets:update", "ticketKnowledgeBase:list", "ticketKnowledgeBase:get", "ticketKnowledgeBase:create"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[ticket] Role skipped: ${(e as any).message}`); }
  return created;
}

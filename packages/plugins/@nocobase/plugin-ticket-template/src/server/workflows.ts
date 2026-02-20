import { uid } from '@nocobase/utils';
export async function createTicketWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '工单: 新工单通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '工单: 新工单通知', description: '新工单创建时通知支持团队', type: 'collection', config: { collection: 'tickets', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '工单通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新工单: {{$context.data.title}}', content: '优先级: {{$context.data.priority}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[ticket] Workflow skipped: ${(e as any).message}`); }
  try {
    if (!(await wfRepo.findOne({ filter: { title: '工单: 工单解决通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '工单: 工单解决通知', description: '工单解决后通知提交人', type: 'collection', config: { collection: 'tickets', mode: 2, changed: ['status'], condition: { status: 'resolved' } }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '解决通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '工单已解决: {{$context.data.title}}', content: '您的工单已处理完成。' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[ticket] Workflow 2 skipped: ${(e as any).message}`); }
  return created;
}

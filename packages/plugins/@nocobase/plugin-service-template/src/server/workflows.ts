import { uid } from '@nocobase/utils';
export async function createServiceWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '售后: 新工单通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '售后: 新工单通知', description: '', type: 'collection', config: { collection: 'serviceRequests', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新售后工单: {{$context.data.title}}', content: '类型: {{$context.data.type}}, 优先级: {{$context.data.priority}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[service] Workflow skipped: ${(e as any).message}`); }
  return created;
}

import { uid } from '@nocobase/utils';
export async function createPropertyWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '物业: 新报修通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '物业: 新报修通知', description: '', type: 'collection', config: { collection: 'propRepairRequests', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新报修: {{$context.data.description}}', content: '类别: {{$context.data.category}}, 优先级: {{$context.data.priority}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[property] Workflow skipped: ${(e as any).message}`); }
  return created;
}

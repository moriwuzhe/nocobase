import { uid } from '@nocobase/utils';
export async function createEquipmentWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '设备: 新维修工单' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '设备: 新维修工单', description: '', type: 'collection', config: { collection: 'eqWorkOrders', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '设备维修: {{$context.data.title}}', content: '优先级: {{$context.data.priority}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[equipment] Workflow skipped: ${(e as any).message}`); }
  return created;
}

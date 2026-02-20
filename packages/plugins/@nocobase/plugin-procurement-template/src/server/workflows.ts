import { uid } from '@nocobase/utils';
export async function createProcurementWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '采购: 新采购单通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '采购: 新采购单通知', description: '采购单创建时通知审批人', type: 'collection', config: { collection: 'procPurchaseOrders', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '采购通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新采购单: {{$context.data.title}}', content: '金额: ¥{{$context.data.totalAmount}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[procurement] Workflow skipped: ${(e as any).message}`); }
  return created;
}

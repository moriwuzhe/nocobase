import { uid } from '@nocobase/utils';
export async function createEcommerceWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '电商: 新订单通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '电商: 新订单通知', description: '', type: 'collection', config: { collection: 'ecOrders', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新订单: {{$context.data.orderNo}}', content: '金额: ¥{{$context.data.totalAmount}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[ecommerce] Workflow skipped: ${(e as any).message}`); }
  return created;
}

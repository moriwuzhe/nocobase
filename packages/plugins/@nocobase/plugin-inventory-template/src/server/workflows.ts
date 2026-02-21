import { uid } from '@nocobase/utils';
export async function createInventoryWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '进销存: 库存预警' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '进销存: 库存预警', description: '', type: 'collection', config: { collection: 'invStockMovements', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '库存变动通知', content: '商品出入库操作已完成' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[inventory] Workflow skipped: ${(e as any).message}`); }
  return created;
}

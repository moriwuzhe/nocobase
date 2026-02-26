import { uid } from '@nocobase/utils';
export async function createVehicleWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '车辆: 维保提醒' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '车辆: 维保提醒', description: '', type: 'collection', config: { collection: 'vehicleMaintenance', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '车辆维保: {{$context.data.type}}', content: '里程: {{$context.data.mileage}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[vehicle] Workflow skipped: ${(e as any).message}`); }
  return created;
}

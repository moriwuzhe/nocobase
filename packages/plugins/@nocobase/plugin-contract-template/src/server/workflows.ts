import { uid } from '@nocobase/utils';
export async function createContractWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '合同: 到期提醒' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '合同: 到期提醒', description: '合同到期前30天自动提醒', type: 'collection', config: { collection: 'contracts', mode: 2, changed: ['status'] }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '到期提醒', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '合同即将到期: {{$context.data.title}}', content: '合同 "{{$context.data.title}}" 即将到期，请及时续签。' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[contract] Workflow skipped: ${(e as any).message}`); }
  return created;
}

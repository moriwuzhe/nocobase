import { uid } from '@nocobase/utils';
export async function createMembershipWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '会员: 新会员注册通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '会员: 新会员注册通知', description: '', type: 'collection', config: { collection: 'members', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新会员: {{$context.data.name}}', content: '等级: {{$context.data.level}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[membership] Workflow skipped: ${(e as any).message}`); }
  return created;
}

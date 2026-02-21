import { uid } from '@nocobase/utils';
export async function createRecruitmentWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '招聘: 新候选人通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '招聘: 新候选人通知', description: '', type: 'collection', config: { collection: 'recCandidates', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新候选人: {{$context.data.name}}', content: '来源: {{$context.data.source}}, 阶段: {{$context.data.stage}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[recruitment] Workflow skipped: ${(e as any).message}`); }
  return created;
}

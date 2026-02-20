import { uid } from '@nocobase/utils';
export async function createExpenseWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '报销: 新报销单通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '报销: 新报销单通知', description: '报销单提交时通知财务审批', type: 'collection', config: { collection: 'expenseClaims', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '报销通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新报销单: {{$context.data.title}}', content: '金额: ¥{{$context.data.totalAmount}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[expense] Workflow skipped: ${(e as any).message}`); }
  return created;
}

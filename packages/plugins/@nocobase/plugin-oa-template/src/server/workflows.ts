import { uid } from '@nocobase/utils';
export async function createOaWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: 'OA: 新公告发布通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: 'OA: 新公告发布通知', description: '公告发布后自动通知全员', type: 'collection', config: { collection: 'oaAnnouncements', mode: 2, changed: ['status'], condition: { status: 'published' } }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '公告通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新公告: {{$context.data.title}}', content: '{{$context.data.title}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[oa] Workflow skipped: ${(e as any).message}`); }
  try {
    if (!(await wfRepo.findOne({ filter: { title: 'OA: 会议预约确认' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: 'OA: 会议预约确认', description: '会议预约创建后通知参与人', type: 'collection', config: { collection: 'oaMeetingBookings', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '预约通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '会议预约: {{$context.data.subject}}', content: '时间: {{$context.data.startTime}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[oa] Workflow 2 skipped: ${(e as any).message}`); }
  return created;
}

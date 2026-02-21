import { uid } from '@nocobase/utils';
export async function createEducationWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;
  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '教务: 新学生注册通知' } }))) {
      const wf = await wfRepo.create({ values: { key: uid(), title: '教务: 新学生注册通知', description: '', type: 'collection', config: { collection: 'eduStudents', mode: 1 }, enabled: false, current: true } });
      await nodeRepo.create({ values: { key: uid(), title: '通知', type: 'notification', workflowId: wf.id, config: { notificationType: 'in-app-message', message: { title: '新学生: {{$context.data.name}}', content: '年级: {{$context.data.grade}}, 班级: {{$context.data.className}}' } } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[education] Workflow skipped: ${(e as any).message}`); }
  return created;
}

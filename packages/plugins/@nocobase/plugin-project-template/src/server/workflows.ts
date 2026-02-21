/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createProjectWorkflows(app: any): Promise<number> {
  const db = app.db;
  const wfRepo = db.getRepository('workflows');
  const nodeRepo = db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;

  try {
    const existing = await wfRepo.findOne({ filter: { title: '项目: 任务逾期提醒' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: '项目: 任务逾期提醒',
          description: '当任务状态变更且已逾期时，自动发送提醒通知',
          type: 'collection',
          config: { collection: 'pmTasks', mode: 2, changed: ['status'] },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(), title: '逾期提醒', type: 'notification', workflowId: workflow.id,
          config: { notificationType: 'in-app-message', message: { title: '任务逾期: {{$context.data.title}}', content: '任务 "{{$context.data.title}}" 已逾期，请尽快处理。' } },
        },
      });
      created++;
    }
  } catch (e) { app.logger.debug(`[project] Workflow skipped: ${(e as any).message}`); }

  try {
    const existing = await wfRepo.findOne({ filter: { title: '项目: 任务完成通知' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: '项目: 任务完成通知',
          description: '当任务状态变为"已完成"时通知项目经理',
          type: 'collection',
          config: { collection: 'pmTasks', mode: 2, changed: ['status'], condition: { status: 'done' } },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(), title: '完成通知', type: 'notification', workflowId: workflow.id,
          config: { notificationType: 'in-app-message', message: { title: '✅ 任务完成: {{$context.data.title}}', content: '任务已完成。' } },
        },
      });
      created++;
    }
  } catch (e) { app.logger.debug(`[project] Workflow 2 skipped: ${(e as any).message}`); }

  return created;
}

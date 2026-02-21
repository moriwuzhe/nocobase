/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createHrWorkflows(app: any): Promise<number> {
  const db = app.db;
  const wfRepo = db.getRepository('workflows');
  const nodeRepo = db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;

  try {
    const existing = await wfRepo.findOne({ filter: { title: 'HR: 请假申请通知' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: 'HR: 请假申请通知',
          description: '员工提交请假申请后自动通知HR和直属上级',
          type: 'collection',
          config: { collection: 'hrLeaveRequests', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(), title: '请假通知', type: 'notification', workflowId: workflow.id,
          config: { notificationType: 'in-app-message', message: { title: '新请假申请', content: '员工提交了 {{$context.data.type}} 请假申请，从 {{$context.data.startDate}} 到 {{$context.data.endDate}}，共 {{$context.data.days}} 天。' } },
        },
      });
      created++;
    }
  } catch (e) { app.logger.debug(`[hr] Workflow skipped: ${(e as any).message}`); }

  try {
    const existing = await wfRepo.findOne({ filter: { title: 'HR: 新员工入职通知' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: 'HR: 新员工入职通知',
          description: '新员工记录创建后自动通知HR部门',
          type: 'collection',
          config: { collection: 'hrEmployees', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(), title: '入职通知', type: 'notification', workflowId: workflow.id,
          config: { notificationType: 'in-app-message', message: { title: '新员工入职: {{$context.data.name}}', content: '{{$context.data.name}} 已加入 {{$context.data.department}} 部门，职位: {{$context.data.position}}。' } },
        },
      });
      created++;
    }
  } catch (e) { app.logger.debug(`[hr] Workflow 2 skipped: ${(e as any).message}`); }

  return created;
}

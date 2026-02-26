/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createClinicWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '诊所: 新预约通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '诊所: 新预约通知',
          description: '新建预约后通知诊所值班人员',
          type: 'collection',
          config: { collection: 'clinicAppointments', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '预约通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新预约: {{$context.data.doctor}}',
              content:
                '预约日期 {{$context.data.appointmentDate}}，科室 {{$context.data.department}}，时段 {{$context.data.timeSlot}}',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[clinic] Workflow skipped: ${(e as any).message}`);
  }

  try {
    if (!(await wfRepo.findOne({ filter: { title: '诊所: 就诊完成提醒' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '诊所: 就诊完成提醒',
          description: '预约状态更新为已完成时发送通知',
          type: 'collection',
          config: {
            collection: 'clinicAppointments',
            mode: 2,
            changed: ['status'],
            condition: { status: 'completed' },
          },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '完成提醒',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '预约已完成',
              content: '医生 {{$context.data.doctor}} 已完成就诊，请跟进复诊或费用结算。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[clinic] Workflow skipped: ${(e as any).message}`);
  }

  return created;
}

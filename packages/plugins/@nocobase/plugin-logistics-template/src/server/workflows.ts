/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createLogisticsWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '物流: 新运单创建通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '物流: 新运单创建通知',
          description: '新建运单后通知调度员',
          type: 'collection',
          config: { collection: 'logShipments', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '运单通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新运单: {{$context.data.trackingNo}}',
              content:
                '发货人 {{$context.data.sender}}，收货人 {{$context.data.receiver}}，状态 {{$context.data.status}}',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[logistics] Workflow skipped: ${(e as any).message}`);
  }

  try {
    if (!(await wfRepo.findOne({ filter: { title: '物流: 运单签收通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '物流: 运单签收通知',
          description: '运单状态更新为已签收时发送通知',
          type: 'collection',
          config: {
            collection: 'logShipments',
            mode: 2,
            changed: ['status'],
            condition: { status: 'delivered' },
          },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '签收通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '运单已签收: {{$context.data.trackingNo}}',
              content: '请确认签收时间与回单资料，必要时触发应收结算流程。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[logistics] Workflow skipped: ${(e as any).message}`);
  }

  return created;
}

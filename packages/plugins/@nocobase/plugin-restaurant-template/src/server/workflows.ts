/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createRestaurantWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '餐饮: 新订单通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '餐饮: 新订单通知',
          description: '新建订单后通知前台与后厨',
          type: 'collection',
          config: { collection: 'restOrders', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '新订单通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新订单 {{$context.data.orderNo}}',
              content:
                '桌号 {{$context.data.tableNo}}，人数 {{$context.data.guestCount}}，金额 {{$context.data.totalAmount}}',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[restaurant] Workflow skipped: ${(e as any).message}`);
  }

  try {
    if (!(await wfRepo.findOne({ filter: { title: '餐饮: 已结账通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '餐饮: 已结账通知',
          description: '订单状态更新为已结账时发送通知',
          type: 'collection',
          config: {
            collection: 'restOrders',
            mode: 2,
            changed: ['status'],
            condition: { status: 'paid' },
          },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '结账通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '订单已结账 {{$context.data.orderNo}}',
              content: '桌号 {{$context.data.tableNo}} 已结账，请安排餐桌状态更新与翻台。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[restaurant] Workflow skipped: ${(e as any).message}`);
  }

  return created;
}

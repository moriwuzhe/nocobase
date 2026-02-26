/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createItAssetWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: 'IT资产: 新设备入库通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: 'IT资产: 新设备入库通知',
          description: '新增设备后通知运维台账管理员',
          type: 'collection',
          config: { collection: 'itDevices', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '设备入库通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新设备入库: {{$context.data.deviceName}}',
              content: '分类 {{$context.data.category}}，品牌 {{$context.data.brand}}，请完善资产标签与分配信息。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[it-asset] Workflow skipped: ${(e as any).message}`);
  }

  try {
    if (!(await wfRepo.findOne({ filter: { title: 'IT资产: 设备分配提醒' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: 'IT资产: 设备分配提醒',
          description: '设备状态变为使用中时通知资产负责人',
          type: 'collection',
          config: {
            collection: 'itDevices',
            mode: 2,
            changed: ['status'],
            condition: { status: 'in_use' },
          },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '设备分配通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '设备已分配: {{$context.data.deviceName}}',
              content: '使用人 {{$context.data.assignedTo}}，部门 {{$context.data.department}}，请跟踪保修与维护周期。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[it-asset] Workflow skipped: ${(e as any).message}`);
  }

  return created;
}

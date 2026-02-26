/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { uid } from '@nocobase/utils';

export async function createLegalWorkflows(app: any): Promise<number> {
  const wfRepo = app.db.getRepository('workflows');
  const nodeRepo = app.db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;
  try {
    if (!(await wfRepo.findOne({ filter: { title: '法务: 新案件立案通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '法务: 新案件立案通知',
          description: '新建案件后通知法务团队',
          type: 'collection',
          config: { collection: 'legalCases', mode: 1 },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '立案通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新案件: {{$context.data.title}}',
              content: '负责律师 {{$context.data.lawyer}}，优先级 {{$context.data.priority}}，请尽快分配处理。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[legal] Workflow skipped: ${(e as any).message}`);
  }

  try {
    if (!(await wfRepo.findOne({ filter: { title: '法务: 案件结案通知' } }))) {
      const wf = await wfRepo.create({
        values: {
          key: uid(),
          title: '法务: 案件结案通知',
          description: '案件状态更新为已结案时通知相关人员',
          type: 'collection',
          config: {
            collection: 'legalCases',
            mode: 2,
            changed: ['status'],
            condition: { status: 'closed' },
          },
          enabled: false,
          current: true,
        },
      });
      await nodeRepo.create({
        values: {
          key: uid(),
          title: '结案通知',
          type: 'notification',
          workflowId: wf.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '案件已结案: {{$context.data.title}}',
              content: '请补充归档文书与复盘记录，确保法务资料完整。',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[legal] Workflow skipped: ${(e as any).message}`);
  }

  return created;
}

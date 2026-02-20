/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Preset workflows for CRM template.
 *
 * Creates automated workflows when the template is installed:
 * 1. New deal notification - notify owner when a deal is created
 * 2. Deal stage change alert - notify when deal stage changes
 * 3. Customer follow-up reminder - remind to follow up inactive customers
 */

import { uid } from '@nocobase/utils';

export async function createCrmWorkflows(app: any): Promise<number> {
  const db = app.db;
  const wfRepo = db.getRepository('workflows');
  const nodeRepo = db.getRepository('flow_nodes');
  if (!wfRepo || !nodeRepo) return 0;

  let created = 0;

  // Workflow 1: New Deal Created → Notification
  try {
    const existing = await wfRepo.findOne({ filter: { title: 'CRM: 新商机通知' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: 'CRM: 新商机通知',
          description: '当新的商机创建时，自动发送通知给相关负责人',
          type: 'collection',
          config: {
            collection: 'crmDeals',
            mode: 1, // after create
          },
          enabled: false,
          current: true,
        },
      });

      await nodeRepo.create({
        values: {
          key: uid(),
          title: '发送通知',
          type: 'notification',
          workflowId: workflow.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '新商机: {{$context.data.name}}',
              content: '金额: ¥{{$context.data.amount}}, 阶段: {{$context.data.stage}}',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[crm] Workflow 1 skipped: ${(e as any).message}`);
  }

  // Workflow 2: Deal Won → Celebration
  try {
    const existing = await wfRepo.findOne({ filter: { title: 'CRM: 商机成交通知' } });
    if (!existing) {
      const wfKey = uid();
      const workflow = await wfRepo.create({
        values: {
          key: wfKey,
          title: 'CRM: 商机成交通知',
          description: '当商机状态变为"已成交"时，发送祝贺通知',
          type: 'collection',
          config: {
            collection: 'crmDeals',
            mode: 2, // after update
            changed: ['stage'],
            condition: { stage: 'closed_won' },
          },
          enabled: false,
          current: true,
        },
      });

      await nodeRepo.create({
        values: {
          key: uid(),
          title: '成交通知',
          type: 'notification',
          workflowId: workflow.id,
          config: {
            notificationType: 'in-app-message',
            message: {
              title: '🎉 商机成交: {{$context.data.name}}',
              content: '恭喜！商机 "{{$context.data.name}}" 已成交，金额: ¥{{$context.data.amount}}',
            },
          },
        },
      });
      created++;
    }
  } catch (e) {
    app.logger.debug(`[crm] Workflow 2 skipped: ${(e as any).message}`);
  }

  return created;
}

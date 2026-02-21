/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Data Change Notifier
 *
 * Watches specified collections for changes and sends notifications
 * to configured recipients when records are created, updated, or deleted.
 *
 * Configuration is stored in `dataChangeRules` collection:
 * - collectionName: which collection to watch
 * - event: 'create' | 'update' | 'delete' | 'all'
 * - filter: optional conditions (e.g., only when status changes to 'urgent')
 * - notifyField: field containing the user to notify (e.g., 'ownerId', 'assigneeId')
 * - notifyRoles: roles to notify (e.g., ['admin'])
 * - channel: notification channel ('inApp', 'email', 'all')
 * - messageTemplate: template for the notification message
 * - enabled: boolean
 */

import { Database } from '@nocobase/database';

interface ChangeRule {
  collectionName: string;
  event: string;
  notifyField?: string;
  notifyRoles?: string[];
  channel: string;
  messageTemplate: string;
  enabled: boolean;
}

let rulesCache: ChangeRule[] | null = null;
let cacheTime = 0;

async function getRules(db: Database): Promise<ChangeRule[]> {
  if (rulesCache && Date.now() - cacheTime < 60000) return rulesCache;
  try {
    const repo = db.getRepository('dataChangeRules');
    if (!repo) return [];
    const rules = await repo.find({ filter: { enabled: true } });
    rulesCache = (rules || []).map((r: any) => {
      const d = r.toJSON ? r.toJSON() : r;
      return {
        collectionName: d.collectionName,
        event: d.event || 'all',
        notifyField: d.notifyField,
        notifyRoles: d.notifyRoles,
        channel: d.channel || 'inApp',
        messageTemplate: d.messageTemplate || '{{collection}} record {{action}}',
        enabled: d.enabled,
      };
    });
    cacheTime = Date.now();
  } catch { rulesCache = []; }
  return rulesCache || [];
}

function renderTemplate(template: string, vars: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export function registerDataChangeNotifier(db: Database, app: any) {
  const sendNotification = async (userId: number, title: string, content: string, channel: string) => {
    try {
      const msgRepo = db.getRepository('messages');
      if (msgRepo) {
        await msgRepo.create({
          values: {
            userId,
            title,
            content,
            category: 'system',
            read: false,
            createdAt: new Date(),
          },
          hooks: false,
        });
      }

      if (channel === 'email' || channel === 'all') {
        const notifPlugin = app.pm.get('notification-manager') as any;
        if (notifPlugin?.send) {
          notifPlugin.send({
            channelName: 'email',
            message: { subject: title, body: content },
            receivers: { type: 'userId', value: [userId] },
          }).catch(() => {});
        }
      }
    } catch { /* non-critical */ }
  };

  const handleEvent = async (eventType: string, model: any, options: any) => {
    const { collection } = model.constructor;
    if (!collection) return;

    const rules = await getRules(db);
    const matching = rules.filter(
      (r) => r.collectionName === collection.name && (r.event === 'all' || r.event === eventType),
    );
    if (matching.length === 0) return;

    const data = model.toJSON ? model.toJSON() : model;
    const currentUserId = options?.context?.state?.currentUser?.id;

    for (const rule of matching) {
      const vars = {
        collection: collection.options.title || collection.name,
        action: eventType === 'create' ? '已创建' : eventType === 'update' ? '已更新' : '已删除',
        recordId: data.id || data[model.constructor.primaryKeyAttribute],
        title: data.title || data.name || `#${data.id}`,
      };
      const message = renderTemplate(rule.messageTemplate, vars);

      const userIds: number[] = [];

      if (rule.notifyField && data[rule.notifyField]) {
        const uid = Number(data[rule.notifyField]);
        if (uid && uid !== currentUserId) userIds.push(uid);
      }

      if (rule.notifyRoles?.length) {
        try {
          const roleUsers = await db.getRepository('rolesUsers').find({
            filter: { roleName: { $in: rule.notifyRoles } },
            fields: ['userId'],
          });
          for (const ru of roleUsers) {
            const uid = ru.userId || (ru as any).get?.('userId');
            if (uid && uid !== currentUserId && !userIds.includes(uid)) {
              userIds.push(uid);
            }
          }
        } catch { /* ignore */ }
      }

      for (const uid of userIds) {
        await sendNotification(uid, `${vars.collection} ${vars.action}`, message, rule.channel);
      }
    }
  };

  db.on('afterCreate', (model: any, options: any) => {
    handleEvent('create', model, options).catch(() => {});
  });

  db.on('afterUpdate', (model: any, options: any) => {
    handleEvent('update', model, options).catch(() => {});
  });

  db.on('afterDestroy', (model: any, options: any) => {
    handleEvent('delete', model, options).catch(() => {});
  });

  db.on('dataChangeRules.afterSave', () => { rulesCache = null; });
  db.on('dataChangeRules.afterDestroy', () => { rulesCache = null; });
}

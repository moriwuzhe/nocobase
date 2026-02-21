/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Field Changelog API
 *
 * Provides a timeline view of all changes made to a specific record,
 * broken down by field. This enables:
 * - "Who changed this field and when?"
 * - "What was the previous value?"
 * - Full audit trail for compliance
 *
 * Data comes from the existing auditLogs + auditChanges collections.
 */

export function registerFieldChangelogActions(app: any) {
  app.resourceManager.define({
    name: 'fieldChangelog',
    actions: {
      /**
       * GET /api/fieldChangelog:get
       * Params: { collectionName, recordId, fieldName? }
       *
       * Returns the full change history for a record, optionally filtered to a single field.
       */
      async get(ctx: any, next: any) {
        const { collectionName, recordId, fieldName } = ctx.action.params;

        if (!collectionName || !recordId) {
          return ctx.throw(400, 'collectionName and recordId are required');
        }

        const auditLogRepo = ctx.db.getRepository('auditLogs');
        if (!auditLogRepo) {
          ctx.body = { timeline: [] };
          return next();
        }

        const logs = await auditLogRepo.find({
          filter: { collectionName, recordId: String(recordId) },
          sort: ['-createdAt'],
          appends: ['changes', 'user'],
          limit: 200,
        });

        const timeline: any[] = [];

        for (const log of logs) {
          const logData = log.toJSON ? log.toJSON() : log;
          const changes = logData.changes || [];

          for (const change of changes) {
            const field = change.field;
            if (!field) continue;
            if (field.name === '_sensitiveAudit' || field.name === '_loginAudit') continue;
            if (fieldName && field.name !== fieldName) continue;

            timeline.push({
              id: `${logData.id}-${field.name}`,
              type: logData.type,
              fieldName: field.name,
              fieldTitle: field.uiSchema?.title || field.title || field.name,
              before: change.before,
              after: change.after,
              userId: logData.userId,
              userNickname: logData.user?.nickname || `User #${logData.userId}`,
              changedAt: logData.createdAt,
            });
          }
        }

        ctx.body = {
          collectionName,
          recordId,
          fieldName: fieldName || null,
          total: timeline.length,
          timeline,
        };
        await next();
      },

      /**
       * GET /api/fieldChangelog:fieldSummary
       * Params: { collectionName, recordId }
       *
       * Returns a summary of which fields have been changed and how many times.
       */
      async fieldSummary(ctx: any, next: any) {
        const { collectionName, recordId } = ctx.action.params;

        if (!collectionName || !recordId) {
          return ctx.throw(400, 'collectionName and recordId are required');
        }

        const auditLogRepo = ctx.db.getRepository('auditLogs');
        if (!auditLogRepo) {
          ctx.body = { fields: {} };
          return next();
        }

        const logs = await auditLogRepo.find({
          filter: { collectionName, recordId: String(recordId) },
          appends: ['changes'],
        });

        const fields: Record<string, { count: number; lastChanged: string; lastValue: any }> = {};

        for (const log of logs) {
          const logData = log.toJSON ? log.toJSON() : log;
          for (const change of logData.changes || []) {
            const name = change.field?.name;
            if (!name || name.startsWith('_')) continue;

            if (!fields[name]) {
              fields[name] = { count: 0, lastChanged: logData.createdAt, lastValue: change.after };
            }
            fields[name].count++;
            if (new Date(logData.createdAt) > new Date(fields[name].lastChanged)) {
              fields[name].lastChanged = logData.createdAt;
              fields[name].lastValue = change.after;
            }
          }
        }

        ctx.body = { collectionName, recordId, fields };
        await next();
      },

      /**
       * GET /api/fieldChangelog:diff
       * Params: { collectionName, recordId, fromDate?, toDate? }
       *
       * Returns a diff of all field values between two points in time.
       */
      async diff(ctx: any, next: any) {
        const { collectionName, recordId, fromDate, toDate } = ctx.action.params;

        if (!collectionName || !recordId) {
          return ctx.throw(400, 'collectionName and recordId are required');
        }

        const filter: any = { collectionName, recordId: String(recordId) };
        if (fromDate || toDate) {
          filter.createdAt = {};
          if (fromDate) filter.createdAt.$gte = new Date(fromDate);
          if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        const auditLogRepo = ctx.db.getRepository('auditLogs');
        if (!auditLogRepo) {
          ctx.body = { diff: {} };
          return next();
        }

        const logs = await auditLogRepo.find({
          filter,
          sort: ['createdAt'],
          appends: ['changes'],
        });

        const diff: Record<string, { original: any; current: any; changeCount: number }> = {};

        for (const log of logs) {
          const logData = log.toJSON ? log.toJSON() : log;
          for (const change of logData.changes || []) {
            const name = change.field?.name;
            if (!name || name.startsWith('_')) continue;

            if (!diff[name]) {
              diff[name] = { original: change.before, current: change.after, changeCount: 0 };
            }
            diff[name].current = change.after;
            diff[name].changeCount++;
          }
        }

        ctx.body = { collectionName, recordId, fromDate, toDate, diff };
        await next();
      },
    },
  });

  app.acl.allow('fieldChangelog', ['get', 'fieldSummary', 'diff'], 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.audit-logs.field-changelog',
    actions: ['fieldChangelog:*'],
  });
}

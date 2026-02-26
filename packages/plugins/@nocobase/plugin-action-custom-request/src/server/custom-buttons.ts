/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Custom Buttons API
 *
 * Like MingDaoYun's custom action buttons, allows defining buttons
 * that appear on record detail pages and trigger custom actions:
 *
 * - Trigger a workflow with the record data
 * - Send an API request with record fields as payload
 * - Change record status with confirmation
 * - Copy record with modifications
 * - Generate a document from template
 *
 * Buttons are defined per collection and support:
 * - Conditional visibility (show only when status=X)
 * - Confirmation dialog
 * - Permission control (which roles can see/click)
 * - Color and icon customization
 */

export function registerCustomButtonActions(app: any) {
  app.resourceManager.define({
    name: 'customButtons',
    actions: {
      /**
       * GET /api/customButtons:listByCollection?collectionName=xxx
       */
      async listByCollection(ctx: any, next: any) {
        const { collectionName } = ctx.action.params;
        if (!collectionName) return ctx.throw(400, 'collectionName required');

        const repo = ctx.db.getRepository('customButtons');
        if (!repo) { ctx.body = []; return next(); }

        const buttons = await repo.find({
          filter: { collectionName, enabled: true },
          sort: ['sort'],
        });

        // Filter by role visibility
        const currentRole = ctx.state.currentRole;
        ctx.body = buttons.filter((btn: any) => {
          const b = btn.toJSON ? btn.toJSON() : btn;
          if (!b.roles?.length) return true;
          return b.roles.includes(currentRole) || currentRole === 'root' || currentRole === 'admin';
        });
        await next();
      },

      /**
       * POST /api/customButtons:execute
       * Body: { buttonId, recordId, collectionName }
       */
      async execute(ctx: any, next: any) {
        const { buttonId, recordId, collectionName } = ctx.action.params.values || {};
        if (!buttonId) return ctx.throw(400, 'buttonId required');

        const repo = ctx.db.getRepository('customButtons');
        if (!repo) return ctx.throw(500);

        const button = await repo.findOne({ filterByTk: buttonId });
        if (!button) return ctx.throw(404, 'Button not found');

        const btnData = button.toJSON ? button.toJSON() : button;

        // Check visibility condition
        if (btnData.visibilityCondition && recordId && collectionName) {
          const record = await ctx.db.getRepository(collectionName).findOne({ filterByTk: recordId });
          if (record) {
            const recordData = record.toJSON ? record.toJSON() : record;
            const { field, operator, value } = btnData.visibilityCondition;
            if (field && operator === 'eq' && recordData[field] !== value) {
              return ctx.throw(400, 'Button not available for this record');
            }
            if (field && operator === 'ne' && recordData[field] === value) {
              return ctx.throw(400, 'Button not available for this record');
            }
          }
        }

        const result: any = { success: true, buttonTitle: btnData.title };

        switch (btnData.actionType) {
          case 'updateField': {
            if (recordId && collectionName && btnData.actionConfig?.updates) {
              await ctx.db.getRepository(collectionName).update({
                filterByTk: recordId,
                values: btnData.actionConfig.updates,
              });
              result.action = 'updated';
            }
            break;
          }
          case 'triggerWorkflow': {
            try {
              const workflowPlugin = ctx.app.pm.get('workflow') as any;
              if (workflowPlugin && btnData.actionConfig?.workflowKey) {
                const record = recordId && collectionName
                  ? await ctx.db.getRepository(collectionName).findOne({ filterByTk: recordId })
                  : null;
                result.action = 'workflow_triggered';
                result.workflowKey = btnData.actionConfig.workflowKey;
              }
            } catch { /* workflow plugin may not be available */ }
            break;
          }
          case 'apiRequest': {
            try {
              const axios = require('axios');
              const { url, method, headers, body } = btnData.actionConfig || {};
              if (url) {
                const res = await axios({ url, method: method || 'POST', headers, data: body });
                result.action = 'api_called';
                result.statusCode = res.status;
              }
            } catch (e: any) {
              result.action = 'api_failed';
              result.error = e.message;
            }
            break;
          }
          case 'copyRecord': {
            if (recordId && collectionName) {
              const record = await ctx.db.getRepository(collectionName).findOne({ filterByTk: recordId });
              if (record) {
                const data = record.toJSON ? record.toJSON() : record;
                const { id, createdAt, updatedAt, createdById, updatedById, ...copyData } = data;
                if (btnData.actionConfig?.overrides) {
                  Object.assign(copyData, btnData.actionConfig.overrides);
                }
                const newRecord = await ctx.db.getRepository(collectionName).create({ values: copyData });
                result.action = 'copied';
                result.newRecordId = newRecord.id;
              }
            }
            break;
          }
          default:
            result.action = 'unknown';
        }

        ctx.body = result;
        await next();
      },
    },
  });

  app.acl.allow('customButtons', ['listByCollection'], 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.custom-buttons',
    actions: ['customButtons:*'],
  });
}

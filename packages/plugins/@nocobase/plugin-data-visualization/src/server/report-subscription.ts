/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Report Subscription Service
 *
 * Allows users to subscribe to chart/report updates and receive
 * periodic summaries via email or in-app notifications.
 *
 * Features:
 * - Subscribe to specific charts or dashboards
 * - Configurable frequency (daily/weekly/monthly)
 * - Delivery channels (email, in-app)
 * - Data snapshot comparison (highlight changes)
 */

export function registerReportSubscriptionActions(app: any) {
  app.resourceManager.define({
    name: 'reportSubscriptions',
    actions: {
      /**
       * POST /api/reportSubscriptions:subscribe
       * Body: { chartId, frequency, channel }
       */
      async subscribe(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);

        const { chartId, frequency = 'weekly', channel = 'inApp', dashboardId } = ctx.action.params.values || {};
        if (!chartId && !dashboardId) return ctx.throw(400, 'chartId or dashboardId is required');

        const repo = ctx.db.getRepository('reportSubscriptions');
        if (!repo) {
          ctx.body = { success: false, error: 'reportSubscriptions collection not available' };
          return next();
        }

        const existing = await repo.findOne({
          filter: { userId, chartId: chartId || null, dashboardId: dashboardId || null },
        });

        if (existing) {
          await repo.update({
            filterByTk: existing.id,
            values: { frequency, channel, enabled: true },
          });
          ctx.body = { success: true, action: 'updated' };
        } else {
          await repo.create({
            values: { userId, chartId, dashboardId, frequency, channel, enabled: true },
          });
          ctx.body = { success: true, action: 'created' };
        }
        await next();
      },

      /**
       * POST /api/reportSubscriptions:unsubscribe
       * Body: { chartId } or { dashboardId }
       */
      async unsubscribe(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);

        const { chartId, dashboardId } = ctx.action.params.values || {};
        const filter: any = { userId };
        if (chartId) filter.chartId = chartId;
        if (dashboardId) filter.dashboardId = dashboardId;

        const repo = ctx.db.getRepository('reportSubscriptions');
        if (!repo) { ctx.body = { success: true }; return next(); }

        await repo.update({ filter, values: { enabled: false } });
        ctx.body = { success: true };
        await next();
      },

      /**
       * GET /api/reportSubscriptions:listMine
       */
      async listMine(ctx: any, next: any) {
        const userId = ctx.state.currentUser?.id;
        if (!userId) return ctx.throw(401);

        const repo = ctx.db.getRepository('reportSubscriptions');
        if (!repo) { ctx.body = []; return next(); }

        ctx.body = await repo.find({
          filter: { userId, enabled: true },
          sort: ['-createdAt'],
        });
        await next();
      },
    },
  });

  app.acl.allow('reportSubscriptions', ['subscribe', 'unsubscribe', 'listMine'], 'loggedIn');
  app.acl.registerSnippet({
    name: 'pm.data-visualization.subscriptions',
    actions: ['reportSubscriptions:*'],
  });
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import crypto from 'crypto';
import axios from 'axios';

/**
 * Webhook Hub Plugin
 *
 * Inbound webhooks: expose endpoints that external services can POST to, triggering
 * internal actions (workflow, data create, etc.)
 *
 * Outbound webhooks: subscribe to internal events (collection CRUD, workflow completion,
 * approval, etc.) and POST payloads to external URLs.
 */
export default class PluginWebhookHubServer extends Plugin {
  private outboundCache: Map<string, any[]> = new Map(); // event → webhook configs

  async load() {
    this.app.resourceManager.define({
      name: 'webhooks',
      actions: {
        test: this.handleTest.bind(this),
      },
    });
    this.app.resourceManager.define({ name: 'webhookLogs' });

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['webhooks:*', 'webhookLogs:*'],
    });

    // Inbound webhook endpoint: POST /api/webhooks:receive/:id
    this.app.resourceManager.define({
      name: 'webhookReceiver',
      actions: {
        receive: this.handleInbound.bind(this),
      },
    });
    this.app.acl.allow('webhookReceiver', 'receive', 'public');

    // Register collection event listeners for outbound webhooks
    this.app.on('afterStart', async () => {
      await this.loadOutboundWebhooks();
      this.registerCollectionListeners();
    });

    // Reload outbound cache when webhooks are modified
    this.db.on('webhooks.afterSave', async () => { await this.loadOutboundWebhooks(); });
    this.db.on('webhooks.afterDestroy', async () => { await this.loadOutboundWebhooks(); });
  }

  // -----------------------------------------------------------------------
  // Outbound
  // -----------------------------------------------------------------------

  private async loadOutboundWebhooks() {
    try {
      const webhooks = await this.db.getRepository('webhooks').find({
        filter: { type: 'outbound', enabled: true },
      });
      this.outboundCache.clear();
      for (const wh of webhooks) {
        const events = wh.events || [];
        for (const event of events) {
          if (!this.outboundCache.has(event)) {
            this.outboundCache.set(event, []);
          }
          this.outboundCache.get(event)!.push(wh.toJSON());
        }
      }
    } catch { /* not yet installed */ }
  }

  private registerCollectionListeners() {
    // Listen to all collection afterCreate/afterUpdate/afterDestroy
    for (const event of ['afterCreate', 'afterUpdate', 'afterDestroy']) {
      this.db.on(`*.${event}`, async (model: any, options: any) => {
        const collectionName = model?.constructor?.collection?.name;
        if (!collectionName) return;

        const eventName = `${collectionName}.${event}`;
        const webhooks = this.outboundCache.get(eventName) || [];
        if (webhooks.length === 0) return;

        const payload = {
          event: eventName,
          timestamp: new Date().toISOString(),
          data: model.toJSON ? model.toJSON() : model,
        };

        for (const wh of webhooks) {
          this.deliverOutbound(wh, eventName, payload).catch((err) => {
            this.app.logger.warn(`[webhook-hub] Outbound delivery failed for ${wh.name}:`, err.message);
          });
        }
      });
    }
  }

  private async deliverOutbound(webhook: any, event: string, payload: any, retryCount = 0) {
    const startTime = Date.now();
    let statusCode = 0;
    let responseBody = '';
    let status = 'success';
    let error = '';

    // Sign the payload
    const signature = webhook.secret
      ? crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
      : undefined;

    try {
      const res = await axios({
        method: webhook.method || 'POST',
        url: webhook.url,
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.headers || {}),
          ...(signature ? { 'X-Webhook-Signature': signature } : {}),
          'X-Webhook-Event': event,
        },
        data: payload,
        timeout: webhook.timeoutMs || 10000,
      });
      statusCode = res.status;
      responseBody = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    } catch (err: any) {
      statusCode = err.response?.status || 0;
      responseBody = err.response?.data ? JSON.stringify(err.response.data) : '';
      error = err.message;
      status = err.code === 'ECONNABORTED' ? 'timeout' : 'failed';

      // Retry
      if (retryCount < (webhook.maxRetries || 3)) {
        const delay = Math.pow(2, retryCount) * 1000; // exponential backoff
        setTimeout(() => {
          this.deliverOutbound(webhook, event, payload, retryCount + 1);
        }, delay);
      }
    }

    // Log
    const duration = Date.now() - startTime;
    try {
      await this.db.getRepository('webhookLogs').create({
        values: {
          webhookId: webhook.id,
          event,
          direction: 'outbound',
          statusCode,
          requestBody: payload,
          responseBody,
          duration,
          status,
          error,
          retryCount,
        },
      });
    } catch { /* ignore logging failures */ }
  }

  // -----------------------------------------------------------------------
  // Inbound
  // -----------------------------------------------------------------------

  private async handleInbound(ctx: any, next: any) {
    const { filterByTk } = ctx.action.params;
    const webhook = await ctx.db.getRepository('webhooks').findOne({
      filter: { id: filterByTk, type: 'inbound', enabled: true },
    });

    if (!webhook) {
      return ctx.throw(404, 'Webhook not found');
    }

    // Verify signature if secret is configured
    if (webhook.secret) {
      const signature = ctx.get('X-Webhook-Signature');
      const body = JSON.stringify(ctx.request.body);
      const expected = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
      if (signature !== expected) {
        return ctx.throw(401, 'Invalid signature');
      }
    }

    const startTime = Date.now();

    // Process the inbound data based on configuration
    try {
      const body = ctx.request.body || {};

      // If a target collection is configured, create a record
      if (webhook.collectionName) {
        await ctx.db.getRepository(webhook.collectionName).create({
          values: body,
        });
      }

      // Log the inbound request
      await ctx.db.getRepository('webhookLogs').create({
        values: {
          webhookId: webhook.id,
          event: 'inbound',
          direction: 'inbound',
          statusCode: 200,
          requestHeaders: ctx.headers,
          requestBody: body,
          duration: Date.now() - startTime,
          status: 'success',
        },
      });

      ctx.body = { success: true };
    } catch (err: any) {
      await ctx.db.getRepository('webhookLogs').create({
        values: {
          webhookId: webhook.id,
          event: 'inbound',
          direction: 'inbound',
          statusCode: 500,
          requestBody: ctx.request.body,
          duration: Date.now() - startTime,
          status: 'failed',
          error: err.message,
        },
      });
      return ctx.throw(500, err.message);
    }

    await next();
  }

  /**
   * Test an outbound webhook by sending a test payload.
   */
  private async handleTest(ctx: any, next: any) {
    const { filterByTk } = ctx.action.params;
    const webhook = await ctx.db.getRepository('webhooks').findOne({ filterByTk });
    if (!webhook) return ctx.throw(404);

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from NocoBase' },
    };

    await this.deliverOutbound(webhook.toJSON(), 'test', testPayload);
    ctx.body = { success: true, message: 'Test webhook sent' };
    await next();
  }
}

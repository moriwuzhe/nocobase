/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { Server as HttpServer } from 'http';

/**
 * Realtime Plugin
 *
 * Adds WebSocket support to NocoBase for real-time data push:
 * - Collection change events (create/update/destroy)
 * - Notification push (message center integration)
 * - Approval task updates
 * - Dashboard data refresh signals
 *
 * Clients subscribe to channels like:
 * - "collection:orders" — get notified when orders change
 * - "user:5:notifications" — personal notification push
 * - "dashboard:refresh" — signal to refresh dashboard data
 */
export default class PluginRealtimeServer extends Plugin {
  private clients = new Map<string, Set<any>>(); // channel → Set<ws>
  private wss: any = null;

  async load() {
    // API for other plugins to broadcast messages
    this.app.resourceManager.define({
      name: 'realtime',
      actions: {
        getStatus: this.handleGetStatus.bind(this),
      },
    });
    this.app.acl.allow('realtime', 'getStatus', 'loggedIn');

    // Register collection change listeners
    this.app.on('afterStart', () => {
      this.setupWebSocket();
      this.registerCollectionListeners();
    });
  }

  /**
   * Set up WebSocket server on the same HTTP server.
   */
  private setupWebSocket() {
    try {
      const WebSocket = require('ws');
      const server: HttpServer = (this.app as any).server || (this.app as any).listenServer;
      if (!server) {
        this.app.logger.warn('[realtime] HTTP server not available, WebSocket disabled');
        return;
      }

      this.wss = new WebSocket.Server({ server, path: '/ws' });

      this.wss.on('connection', (ws: any, req: any) => {
        ws.isAlive = true;
        ws.channels = new Set<string>();

        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', (raw: any) => {
          try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === 'subscribe') {
              const channel = msg.channel;
              ws.channels.add(channel);
              if (!this.clients.has(channel)) {
                this.clients.set(channel, new Set());
              }
              this.clients.get(channel)!.add(ws);
              ws.send(JSON.stringify({ type: 'subscribed', channel }));
            }

            if (msg.type === 'unsubscribe') {
              const channel = msg.channel;
              ws.channels.delete(channel);
              this.clients.get(channel)?.delete(ws);
              ws.send(JSON.stringify({ type: 'unsubscribed', channel }));
            }
          } catch { /* ignore malformed messages */ }
        });

        ws.on('close', () => {
          for (const channel of ws.channels) {
            this.clients.get(channel)?.delete(ws);
          }
        });
      });

      // Heartbeat: detect stale connections
      const interval = setInterval(() => {
        this.wss?.clients?.forEach((ws: any) => {
          if (!ws.isAlive) return ws.terminate();
          ws.isAlive = false;
          ws.ping();
        });
      }, 30000);

      this.wss.on('close', () => clearInterval(interval));
      this.app.logger.info('[realtime] WebSocket server started on /ws');
    } catch (err) {
      this.app.logger.warn('[realtime] WebSocket setup failed (ws package may not be installed):', err);
    }
  }

  /**
   * Register database hooks to broadcast collection changes.
   */
  private registerCollectionListeners() {
    for (const event of ['afterCreate', 'afterUpdate', 'afterDestroy']) {
      this.db.on(`*.${event}`, (model: any) => {
        const collectionName = model?.constructor?.collection?.name;
        if (!collectionName) return;

        const channel = `collection:${collectionName}`;
        const action = event.replace('after', '').toLowerCase();

        this.broadcast(channel, {
          type: 'collection_change',
          collection: collectionName,
          action,
          recordId: model.get?.('id'),
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  /**
   * Public API for other plugins to send messages to WebSocket clients.
   */
  broadcast(channel: string, data: any) {
    const subscribers = this.clients.get(channel);
    if (!subscribers?.size) return;

    const message = JSON.stringify({ channel, ...data });
    for (const ws of subscribers) {
      try {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(message);
        }
      } catch { /* ignore send errors */ }
    }
  }

  /**
   * Send a message to a specific user (by userId).
   */
  sendToUser(userId: number, data: any) {
    this.broadcast(`user:${userId}:notifications`, data);
  }

  private async handleGetStatus(ctx: any, next: any) {
    ctx.body = {
      wsEnabled: !!this.wss,
      connectedClients: this.wss?.clients?.size || 0,
      channels: this.clients.size,
      subscriptions: Array.from(this.clients.entries()).map(([ch, subs]) => ({
        channel: ch,
        subscribers: subs.size,
      })),
    };
    await next();
  }

  async remove() {
    this.wss?.close();
    this.clients.clear();
  }
}

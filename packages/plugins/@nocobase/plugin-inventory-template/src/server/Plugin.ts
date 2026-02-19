/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedInventoryData } from './seed-data';

const INV_COLLECTIONS = ['invProducts', 'invStockMovements', 'invStockCheck', 'invWarehouses'];

export default class PluginInventoryTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    try {
      const result = await seedInventoryData(this.db);
      if (result.created > 0) this.app.logger.info(`[inventory-template] Seeded ${result.created} sample records`);
    } catch (err) {
      this.app.logger.warn(`[inventory-template] Seed data skipped: ${err.message}`);
    }
  }

  async load() {
    for (const c of INV_COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: INV_COLLECTIONS.map((c) => `${c}:*`),
    });

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'invDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const [products, movements, warehouses] = await Promise.all([
            db.getRepository('invProducts').find({
              fields: ['sku', 'name', 'quantity', 'minStock', 'category', 'unitPrice'],
            }),
            db.getRepository('invStockMovements').find({
              fields: ['type', 'quantity', 'createdAt'],
              sort: ['-createdAt'],
              limit: 50,
            }),
            db.getRepository('invWarehouses').count(),
          ]);

          const productList = (products || []).map((p: any) => (p.toJSON ? p.toJSON() : p));
          const movementList = (movements || []).map((m: any) => (m.toJSON ? m.toJSON() : m));

          const totalProducts = productList.length;
          const totalStock = productList.reduce((s: number, p: any) => s + (p.quantity || 0), 0);
          const totalValue = productList.reduce(
            (s: number, p: any) => s + (p.quantity || 0) * (p.unitPrice || 0),
            0,
          );
          const lowStockItems = productList.filter(
            (p: any) => p.minStock && p.quantity <= p.minStock,
          );
          const outOfStock = productList.filter((p: any) => (p.quantity || 0) <= 0);

          const byCategory: Record<string, { count: number; quantity: number }> = {};
          for (const p of productList) {
            const cat = p.category || '未分类';
            if (!byCategory[cat]) byCategory[cat] = { count: 0, quantity: 0 };
            byCategory[cat].count++;
            byCategory[cat].quantity += p.quantity || 0;
          }

          const inCount = movementList.filter((m: any) => m.type === 'in').length;
          const outCount = movementList.filter((m: any) => m.type === 'out').length;

          ctx.body = {
            totalProducts,
            totalStock,
            totalValue,
            lowStockCount: lowStockItems.length,
            outOfStockCount: outOfStock.length,
            totalWarehouses: warehouses,
            byCategory,
            recentInCount: inCount,
            recentOutCount: outCount,
            lowStockItems: lowStockItems.slice(0, 10).map((p: any) => ({
              name: p.name,
              sku: p.sku,
              quantity: p.quantity,
              minStock: p.minStock,
            })),
          };
          await next();
        },
      },
    });
    this.app.acl.allow('invDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('invProducts.beforeCreate', async (model: any) => {
      if (!model.get('sku')) {
        const count = await this.db.getRepository('invProducts').count();
        model.set('sku', `SKU${String(count + 1).padStart(6, '0')}`);
      }
    });

    this.db.on('invStockMovements.afterCreate', async (model: any, options: any) => {
      const productId = model.get('productId');
      const type = model.get('type');
      const quantity = model.get('quantity') || 0;

      if (productId && quantity > 0) {
        try {
          const product = await this.db.getRepository('invProducts').findOne({
            filterByTk: productId,
            transaction: options.transaction,
          });
          if (product) {
            const currentQty = product.get('quantity') || 0;
            const newQty = type === 'in' ? currentQty + quantity : Math.max(currentQty - quantity, 0);
            await this.db.getRepository('invProducts').update({
              filterByTk: productId,
              values: { quantity: newQty },
              transaction: options.transaction,
            });
          }
        } catch {
          // non-critical
        }
      }
    });
  }
}

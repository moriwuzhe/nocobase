/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
import { createLogisticsRoles } from './roles';
import { createLogisticsWorkflows } from './workflows';
const COLLECTIONS = ['logShipments', 'logDrivers'];
const DASHBOARD_ACTION = 'logisticsDashboard:stats';
export default class extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try {
      if ((await this.db.getRepository('logShipments').count()) === 0) {
        await this.db.getRepository('logShipments').create({
          values: {
            sender: '上海仓库',
            senderAddress: '上海市浦东新区',
            receiver: '北京客户A',
            receiverAddress: '北京市朝阳区',
            receiverPhone: '13800001111',
            weight: 25.5,
            freight: 120,
            status: 'in_transit',
            driver: '张师傅',
            vehiclePlate: '沪A12345',
          },
        });
        await this.db.getRepository('logShipments').create({
          values: {
            sender: '广州仓库',
            receiver: '深圳客户B',
            receiverAddress: '深圳市南山区',
            receiverPhone: '13800002222',
            weight: 8.2,
            freight: 35,
            status: 'delivered',
          },
        });
        await this.db.getRepository('logDrivers').create({
          values: {
            name: '张师傅',
            phone: '13900001111',
            licenseNo: 'A2',
            vehiclePlate: '沪A12345',
            vehicleType: 'truck_m',
            status: 'on_route',
          },
        });
        await this.db.getRepository('logDrivers').create({
          values: {
            name: '李师傅',
            phone: '13900002222',
            licenseNo: 'B2',
            vehiclePlate: '沪B67890',
            vehicleType: 'van',
            status: 'available',
          },
        });
      }
    } catch (e) {
      this.app.logger.warn(`[logistics] Seed: ${(e as any).message}`);
    }

    try {
      const roleCount = await createLogisticsRoles(this.app);
      if (roleCount > 0) this.app.logger.info(`[logistics] Created ${roleCount} roles`);
    } catch (e) {
      this.app.logger.warn(`[logistics] Roles skipped: ${(e as any).message}`);
    }

    try {
      const workflowCount = await createLogisticsWorkflows(this.app);
      if (workflowCount > 0) this.app.logger.info(`[logistics] Created ${workflowCount} workflows`);
    } catch (e) {
      this.app.logger.warn(`[logistics] Workflows skipped: ${(e as any).message}`);
    }

    try {
      await createTemplateUI(this.app, '仓库物流', 'CarOutlined', [
        {
          title: '运单管理',
          icon: 'SendOutlined',
          collectionName: 'logShipments',
          fields: [
            'trackingNo',
            'sender',
            'receiver',
            'receiverPhone',
            'weight',
            'freight',
            'status',
            'driver',
            'vehiclePlate',
            'shipDate',
          ],
          formFields: [
            'sender',
            'senderAddress',
            'receiver',
            'receiverAddress',
            'receiverPhone',
            'weight',
            'freight',
            'status',
            'driver',
            'vehiclePlate',
            'shipDate',
            'remark',
          ],
        },
        {
          title: '司机管理',
          icon: 'UserOutlined',
          collectionName: 'logDrivers',
          fields: ['name', 'phone', 'licenseNo', 'vehiclePlate', 'vehicleType', 'status'],
          formFields: ['name', 'phone', 'licenseNo', 'vehiclePlate', 'vehicleType', 'status'],
        },
      ]);
    } catch (e) {
      this.app.logger.warn(`[logistics] UI: ${(e as any).message}`);
    }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: [...COLLECTIONS.map((c) => `${c}:*`), DASHBOARD_ACTION],
    });

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'logisticsDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const [shipments, drivers] = await Promise.all([
            ctx.db.getRepository('logShipments').find({
              fields: ['status'],
            }),
            ctx.db.getRepository('logDrivers').find({
              fields: ['status'],
            }),
          ]);

          const shipmentList = (shipments || []).map((item: any) => (item.toJSON ? item.toJSON() : item));
          const driverList = (drivers || []).map((item: any) => (item.toJSON ? item.toJSON() : item));

          const inTransit = shipmentList.filter((item: any) =>
            ['in_transit', 'delivering'].includes(item.status),
          ).length;
          const delivered = shipmentList.filter((item: any) => item.status === 'delivered').length;
          const pending = shipmentList.filter((item: any) => item.status === 'pending').length;

          ctx.body = {
            totalShipments: shipmentList.length,
            inTransitShipments: inTransit,
            deliveredShipments: delivered,
            pendingShipments: pending,
            deliveryRate: shipmentList.length ? Math.round((delivered / shipmentList.length) * 100) : 0,
            totalDrivers: driverList.length,
            availableDrivers: driverList.filter((item: any) => item.status === 'available').length,
            onRouteDrivers: driverList.filter((item: any) => item.status === 'on_route').length,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('logisticsDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('logShipments.beforeCreate', async (m: any) => {
      if (!m.get('trackingNo')) {
        const c = await this.db.getRepository('logShipments').count();
        m.set('trackingNo', `SF${new Date().getFullYear()}${String(c + 1).padStart(8, '0')}`);
      }
    });
  }
}

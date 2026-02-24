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
import { createItAssetRoles } from './roles';
import { createItAssetWorkflows } from './workflows';
const COLLECTIONS = ['itDevices', 'itLicenses'];
export default class extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try {
      if ((await this.db.getRepository('itDevices').count()) === 0) {
        await this.db.getRepository('itDevices').create({
          values: {
            deviceName: 'MacBook Pro 14',
            category: 'laptop',
            brand: 'Apple',
            model: 'M3 Pro',
            status: 'in_use',
            assignedTo: '张工',
            department: '技术部',
            purchasePrice: 16999,
          },
        });
        await this.db.getRepository('itDevices').create({
          values: {
            deviceName: 'Dell显示器27寸',
            category: 'monitor',
            brand: 'Dell',
            model: 'U2723QE',
            status: 'in_use',
            assignedTo: '张工',
            department: '技术部',
            purchasePrice: 3499,
          },
        });
        await this.db.getRepository('itDevices').create({
          values: {
            deviceName: 'ThinkPad X1',
            category: 'laptop',
            brand: 'Lenovo',
            model: 'X1 Carbon Gen11',
            status: 'in_stock',
            purchasePrice: 12999,
          },
        });
        await this.db.getRepository('itLicenses').create({
          values: {
            softwareName: 'Microsoft 365',
            licenseType: 'annual',
            seats: 50,
            usedSeats: 35,
            cost: 25000,
            vendor: '微软',
          },
        });
        await this.db.getRepository('itLicenses').create({
          values: {
            softwareName: 'JetBrains全家桶',
            licenseType: 'annual',
            seats: 10,
            usedSeats: 8,
            cost: 15000,
            vendor: 'JetBrains',
          },
        });
      }
    } catch (e) {
      this.app.logger.warn(`[it-asset] Seed: ${(e as any).message}`);
    }

    try {
      const roleCount = await createItAssetRoles(this.app);
      if (roleCount > 0) this.app.logger.info(`[it-asset] Created ${roleCount} roles`);
    } catch (e) {
      this.app.logger.warn(`[it-asset] Roles skipped: ${(e as any).message}`);
    }

    try {
      const workflowCount = await createItAssetWorkflows(this.app);
      if (workflowCount > 0) this.app.logger.info(`[it-asset] Created ${workflowCount} workflows`);
    } catch (e) {
      this.app.logger.warn(`[it-asset] Workflows skipped: ${(e as any).message}`);
    }

    try {
      await createTemplateUI(this.app, 'IT资产管理', 'LaptopOutlined', [
        {
          title: '设备管理',
          icon: 'LaptopOutlined',
          collectionName: 'itDevices',
          fields: [
            'assetTag',
            'deviceName',
            'category',
            'brand',
            'model',
            'status',
            'assignedTo',
            'department',
            'purchasePrice',
          ],
          formFields: [
            'deviceName',
            'category',
            'brand',
            'model',
            'serialNumber',
            'status',
            'assignedTo',
            'department',
            'purchaseDate',
            'purchasePrice',
            'warrantyExpiry',
            'notes',
          ],
        },
        {
          title: '软件许可',
          icon: 'KeyOutlined',
          collectionName: 'itLicenses',
          fields: ['softwareName', 'licenseType', 'seats', 'usedSeats', 'expiryDate', 'cost', 'vendor'],
          formFields: [
            'softwareName',
            'licenseKey',
            'licenseType',
            'seats',
            'usedSeats',
            'expiryDate',
            'cost',
            'vendor',
          ],
        },
      ]);
    } catch (e) {
      this.app.logger.warn(`[it-asset] UI: ${(e as any).message}`);
    }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });
    this.db.on('itDevices.beforeCreate', async (m: any) => {
      if (!m.get('assetTag')) {
        const c = await this.db.getRepository('itDevices').count();
        m.set('assetTag', `IT${String(c + 1).padStart(6, '0')}`);
      }
    });
  }
}

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, InstallOptions } from '@nocobase/server';
import { seedOaData } from './seed-data';
import { createTemplateUI } from './ui-schema-generator';
import { createOaRoles } from './roles';
import { createOaWorkflows } from './workflows';

const OA_COLLECTIONS = [
  'oaAnnouncements',
  'oaMeetingRooms',
  'oaMeetingBookings',
  'oaAssets',
  'oaVisitors',
  'oaWorkReports',
];

export default class PluginOaTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    // Skip heavy operations for sub-apps
    if (this.app.name && this.app.name !== 'main') return;

    try {
      const result = await seedOaData(this.db);
      if (result.created > 0) this.app.logger.info(`[oa-template] Seeded ${result.created} records`);
    } catch (err) { this.app.logger.warn(`[oa-template] Seed skipped: ${(err as any).message}`); }
        try { const rc = await createOaRoles(this.app); if (rc > 0) this.app.logger.info(`[oa] Created ${rc} roles`); } catch (e) { this.app.logger.warn(`[oa] Roles skipped: ${(e as any).message}`); }
try { const wf = await createOaWorkflows(this.app); if (wf > 0) this.app.logger.info(`[oa] Created ${wf} workflows`); } catch (e) { this.app.logger.warn(`[oa] Workflows skipped: ${(e as any).message}`); }

    try {
      await createTemplateUI(this.app, 'OA 协同办公', 'DesktopOutlined', [
        { title: '公告管理', icon: 'NotificationOutlined', collectionName: 'oaAnnouncements', fields: ['title','priority','status'], formFields: ['title','content','priority','status'] },
        { title: '会议室', icon: 'VideoCameraOutlined', collectionName: 'oaMeetingRooms', fields: ['name','capacity','equipment'], formFields: ['name','capacity','equipment'] },
        { title: '会议预约', icon: 'CalendarOutlined', collectionName: 'oaMeetingBookings', fields: ['subject','startTime','endTime','status'], formFields: ['subject','startTime','endTime','attendees'] },
        { title: '固定资产', icon: 'LaptopOutlined', collectionName: 'oaAssets', fields: ['name','category','serialNumber','status','purchasePrice'], formFields: ['name','category','serialNumber','status','purchaseDate','purchasePrice'] },
        { title: '访客登记', icon: 'UserSwitchOutlined', collectionName: 'oaVisitors', fields: ['company','purpose','status'], formFields: ['company','phone','purpose'] },
      ]);
    } catch (err) { this.app.logger.warn(`[oa-template] UI creation skipped: ${(err as any).message}`); }
  }

  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: OA_COLLECTIONS.map((c) => `${c}:*`),
    });
    this.app.acl.allow('oaAnnouncements', ['list', 'get'], 'loggedIn');
    this.app.acl.allow('oaMeetingRooms', ['list', 'get'], 'loggedIn');
    this.app.acl.allow('oaMeetingBookings', '*', 'loggedIn');
    this.app.acl.allow('oaAssets', ['list', 'get'], 'loggedIn');
    this.app.acl.allow('oaVisitors', '*', 'loggedIn');
    this.app.acl.allow('oaWorkReports', '*', 'loggedIn');

    this.registerDashboardAction();
    this.registerHooks();
  }

  private registerDashboardAction() {
    this.app.resourceManager.define({
      name: 'oaDashboard',
      actions: {
        stats: async (ctx: any, next: any) => {
          const db = ctx.db;
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

          const [announcements, meetingRooms, todayBookings, assets, visitors] =
            await Promise.all([
              db.getRepository('oaAnnouncements').find({
                fields: ['status', 'priority'],
              }),
              db.getRepository('oaMeetingRooms').count(),
              db.getRepository('oaMeetingBookings').find({
                filter: {
                  startTime: { $gte: todayStart, $lt: todayEnd },
                },
                fields: ['status', 'roomId'],
              }),
              db.getRepository('oaAssets').find({
                fields: ['status', 'category'],
              }),
              db.getRepository('oaVisitors').find({
                filter: {
                  visitDate: { $gte: todayStart, $lt: todayEnd },
                },
                fields: ['status'],
              }),
            ]);

          const announcementList = (announcements || []).map((a: any) =>
            a.toJSON ? a.toJSON() : a,
          );
          const activeAnnouncements = announcementList.filter(
            (a: any) => a.status === 'published',
          ).length;

          const bookingList = (todayBookings || []).map((b: any) =>
            b.toJSON ? b.toJSON() : b,
          );

          const assetList = (assets || []).map((a: any) => (a.toJSON ? a.toJSON() : a));
          const assetsByCategory: Record<string, number> = {};
          for (const a of assetList) {
            const cat = a.category || '其他';
            assetsByCategory[cat] = (assetsByCategory[cat] || 0) + 1;
          }

          const visitorList = (visitors || []).map((v: any) => (v.toJSON ? v.toJSON() : v));

          ctx.body = {
            totalAnnouncements: announcementList.length,
            activeAnnouncements,
            totalMeetingRooms: meetingRooms,
            todayBookings: bookingList.length,
            totalAssets: assetList.length,
            assetsByCategory,
            todayVisitors: visitorList.length,
          };
          await next();
        },
      },
    });
    this.app.acl.allow('oaDashboard', 'stats', 'loggedIn');
  }

  private registerHooks() {
    this.db.on('oaMeetingBookings.beforeCreate', async (model: any) => {
      const startTime = model.get('startTime');
      const endTime = model.get('endTime');
      const roomId = model.get('roomId');

      if (startTime && endTime && roomId) {
        const conflicts = await this.db.getRepository('oaMeetingBookings').count({
          filter: {
            roomId,
            status: { $ne: 'cancelled' },
            $or: [
              {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
              },
            ],
          },
        });

        if (conflicts > 0) {
          throw new Error('该时间段会议室已被预约');
        }
      }
    });

    this.db.on('oaAnnouncements.beforeSave', async (model: any) => {
      if (model.get('status') === 'published' && !model.get('publishedAt')) {
        model.set('publishedAt', new Date());
      }
    });
  }
}

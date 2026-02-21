/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

function daysAgo(n: number): Date { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }
function daysFromNow(n: number): Date { return new Date(Date.now() + n * 24 * 60 * 60 * 1000); }
function hoursFromNow(h: number): Date { return new Date(Date.now() + h * 60 * 60 * 1000); }

export async function seedOaData(db: Database): Promise<{ created: number }> {
  let created = 0;
  if ((await db.getRepository('oaAnnouncements').count()) > 0) return { created: 0 };

  const announcements = [
    { title: '关于2025年春节放假安排的通知', content: '<p>根据国务院办公厅通知，2025年春节放假时间为1月28日至2月3日，共7天。请各部门提前做好工作交接。</p>', priority: 'important', status: 'published', publishedAt: daysAgo(5) },
    { title: '公司年度体检通知', content: '<p>公司将于下月15日组织全体员工年度体检，请提前预留时间。体检机构：美年大健康。</p>', priority: 'normal', status: 'published', publishedAt: daysAgo(2) },
    { title: '办公室网络升级维护公告', content: '<p>本周六（00:00-06:00）将进行网络设备升级维护，期间网络可能短暂中断。</p>', priority: 'urgent', status: 'published', publishedAt: daysAgo(1) },
    { title: '新员工入职培训安排', content: '<p>本月新入职员工请于周一上午9:00在3楼培训室参加入职培训。</p>', priority: 'normal', status: 'draft' },
  ];
  for (const a of announcements) { await db.getRepository('oaAnnouncements').create({ values: a }); created++; }

  const rooms = [
    { name: '会议室A（大）', capacity: 20, floor: '3楼', equipment: '投影仪、白板、视频会议', status: 'available' },
    { name: '会议室B（中）', capacity: 10, floor: '3楼', equipment: '投影仪、白板', status: 'available' },
    { name: '会议室C（小）', capacity: 6, floor: '5楼', equipment: '电视屏幕', status: 'available' },
    { name: '董事会议室', capacity: 30, floor: '8楼', equipment: '投影仪、视频会议、同声传译', status: 'available' },
  ];
  const roomRecords: any[] = [];
  for (const r of rooms) { const rec = await db.getRepository('oaMeetingRooms').create({ values: r }); roomRecords.push(rec); created++; }

  const today = new Date();
  const bookings = [
    { subject: '产品评审会', roomId: roomRecords[0]?.id, startTime: hoursFromNow(2), endTime: hoursFromNow(4), status: 'confirmed' },
    { subject: '技术方案讨论', roomId: roomRecords[1]?.id, startTime: hoursFromNow(5), endTime: hoursFromNow(6), status: 'confirmed' },
    { subject: '客户拜访接待', roomId: roomRecords[3]?.id, startTime: hoursFromNow(24), endTime: hoursFromNow(26), status: 'pending' },
  ];
  for (const b of bookings) { await db.getRepository('oaMeetingBookings').create({ values: b }); created++; }

  const assets = [
    { name: 'MacBook Pro 14寸', category: '电脑', serialNumber: 'SN-MBP-001', status: 'in_use', department: '技术部', purchaseDate: daysAgo(365), purchasePrice: 16999 },
    { name: 'Dell 27寸显示器', category: '显示器', serialNumber: 'SN-DELL-001', status: 'in_use', department: '技术部', purchaseDate: daysAgo(300), purchasePrice: 2499 },
    { name: '佳能打印机 MF746', category: '打印机', serialNumber: 'SN-CANON-001', status: 'in_use', department: '行政部', purchaseDate: daysAgo(200), purchasePrice: 3899 },
    { name: '投影仪 Epson EB-X51', category: '投影仪', serialNumber: 'SN-EPSON-001', status: 'idle', department: '行政部', purchaseDate: daysAgo(500), purchasePrice: 4999 },
  ];
  for (const a of assets) { await db.getRepository('oaAssets').create({ values: a }); created++; }

  return { created };
}

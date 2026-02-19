/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

export async function seedInventoryData(db: Database): Promise<{ created: number }> {
  let created = 0;
  if ((await db.getRepository('invProducts').count()) > 0) return { created: 0 };

  const warehouses = [
    { name: '主仓库', code: 'WH-01', address: '上海市浦东新区张江高科', manager: '李经理', status: 'active' },
    { name: '北京分仓', code: 'WH-02', address: '北京市朝阳区望京', manager: '王主管', status: 'active' },
  ];
  const whRecords: any[] = [];
  for (const w of warehouses) { const rec = await db.getRepository('invWarehouses').create({ values: w }); whRecords.push(rec); created++; }

  const products = [
    { name: '无线蓝牙耳机 Pro', sku: 'SKU-BT-001', category: '电子产品', unitPrice: 299, costPrice: 150, quantity: 520, minStock: 50, unit: '个', warehouseId: whRecords[0]?.id },
    { name: '智能手环 V5', sku: 'SKU-SW-001', category: '电子产品', unitPrice: 199, costPrice: 80, quantity: 380, minStock: 30, unit: '个', warehouseId: whRecords[0]?.id },
    { name: 'USB-C 数据线 1m', sku: 'SKU-CB-001', category: '配件', unitPrice: 29, costPrice: 8, quantity: 2000, minStock: 200, unit: '条', warehouseId: whRecords[0]?.id },
    { name: '笔记本电脑支架', sku: 'SKU-ST-001', category: '办公用品', unitPrice: 159, costPrice: 65, quantity: 150, minStock: 20, unit: '个', warehouseId: whRecords[0]?.id },
    { name: '机械键盘 87键', sku: 'SKU-KB-001', category: '电子产品', unitPrice: 399, costPrice: 180, quantity: 85, minStock: 10, unit: '个', warehouseId: whRecords[1]?.id },
    { name: 'A4打印纸 500张/包', sku: 'SKU-PP-001', category: '办公用品', unitPrice: 25, costPrice: 15, quantity: 8, minStock: 20, unit: '包', warehouseId: whRecords[0]?.id },
    { name: '显示器清洁套装', sku: 'SKU-CL-001', category: '清洁用品', unitPrice: 39, costPrice: 12, quantity: 45, minStock: 10, unit: '套', warehouseId: whRecords[0]?.id },
    { name: '无线鼠标', sku: 'SKU-MS-001', category: '电子产品', unitPrice: 89, costPrice: 35, quantity: 0, minStock: 15, unit: '个', warehouseId: whRecords[1]?.id },
  ];
  const prodRecords: any[] = [];
  for (const p of products) { const rec = await db.getRepository('invProducts').create({ values: p }); prodRecords.push(rec); created++; }

  const now = new Date();
  const movements = [
    { productId: prodRecords[0]?.id, type: 'in', quantity: 200, reason: '采购入库', operator: '张仓管', date: daysAgo(10) },
    { productId: prodRecords[0]?.id, type: 'out', quantity: 50, reason: '销售出库', operator: '张仓管', date: daysAgo(5) },
    { productId: prodRecords[1]?.id, type: 'in', quantity: 100, reason: '采购入库', operator: '李仓管', date: daysAgo(7) },
    { productId: prodRecords[2]?.id, type: 'out', quantity: 300, reason: '电商平台发货', operator: '张仓管', date: daysAgo(3) },
    { productId: prodRecords[5]?.id, type: 'out', quantity: 12, reason: '办公领用', operator: '李仓管', date: daysAgo(1) },
  ];
  for (const m of movements) { await db.getRepository('invStockMovements').create({ values: m }); created++; }

  return { created };
}

function daysAgo(n: number): Date { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

const SAMPLE_CUSTOMERS = [
  { name: '华为技术有限公司', industry: 'tech', size: 'xl', stage: 'customer', rating: 'A', source: 'exhibition', phone: '0755-28780808', email: 'contact@huawei.com', province: '广东', city: '深圳', annualRevenue: 500000000 },
  { name: '腾讯科技有限公司', industry: 'tech', size: 'xl', stage: 'vip', rating: 'A', source: 'partner', phone: '0755-86013388', email: 'contact@tencent.com', province: '广东', city: '深圳', annualRevenue: 300000000 },
  { name: '上海建设银行', industry: 'finance', size: 'xl', stage: 'customer', rating: 'A', source: 'referral', phone: '021-38784000', email: 'service@ccb.com', province: '上海', city: '上海', annualRevenue: 100000000 },
  { name: '北京医疗科技', industry: 'healthcare', size: 'md', stage: 'prospect', rating: 'B', source: 'website', phone: '010-88881234', email: 'info@bjmed.com', province: '北京', city: '北京', annualRevenue: 5000000 },
  { name: '浙江制造集团', industry: 'manufacturing', size: 'lg', stage: 'customer', rating: 'B', source: 'cold_call', phone: '0571-87654321', email: 'sales@zjmfg.com', province: '浙江', city: '杭州', annualRevenue: 20000000 },
  { name: '成都教育科技', industry: 'education', size: 'sm', stage: 'lead', rating: 'C', source: 'social', phone: '028-85551234', email: 'info@cdedu.com', province: '四川', city: '成都', annualRevenue: 1000000 },
  { name: '广州零售连锁', industry: 'retail', size: 'md', stage: 'prospect', rating: 'B', source: 'advertisement', phone: '020-83334567', email: 'hr@gzretail.com', province: '广东', city: '广州', annualRevenue: 8000000 },
  { name: '南京房地产开发', industry: 'real_estate', size: 'lg', stage: 'customer', rating: 'B', source: 'referral', phone: '025-84567890', email: 'info@njproperty.com', province: '江苏', city: '南京', annualRevenue: 50000000 },
];

const SAMPLE_CONTACTS = [
  { name: '张明', position: 'CTO', phone: '13800001111', email: 'zhangming@huawei.com', department: '技术部' },
  { name: '李娜', position: '采购经理', phone: '13800002222', email: 'lina@tencent.com', department: '采购部' },
  { name: '王强', position: '总经理', phone: '13800003333', email: 'wangqiang@ccb.com', department: '管理层' },
  { name: '赵丽', position: '项目总监', phone: '13800004444', email: 'zhaoli@bjmed.com', department: '项目部' },
  { name: '刘伟', position: '采购主管', phone: '13800005555', email: 'liuwei@zjmfg.com', department: '供应链' },
  { name: '陈芳', position: '行政经理', phone: '13800006666', email: 'chenfang@cdedu.com', department: '行政部' },
];

const SAMPLE_DEALS = [
  { name: '华为云平台部署项目', amount: 2500000, stage: 'negotiation', probability: 75, currency: 'CNY' },
  { name: '腾讯数据中台升级', amount: 1800000, stage: 'proposal', probability: 50, currency: 'CNY' },
  { name: '建行数字化转型咨询', amount: 800000, stage: 'qualification', probability: 10, currency: 'CNY' },
  { name: '医疗信息系统采购', amount: 350000, stage: 'needs_analysis', probability: 25, currency: 'CNY' },
  { name: '制造业ERP实施', amount: 1200000, stage: 'closed_won', probability: 100, currency: 'CNY' },
  { name: '零售POS系统集成', amount: 450000, stage: 'closed_lost', probability: 0, currency: 'CNY' },
];

const SAMPLE_ACTIVITIES = [
  { type: 'call', subject: '需求初步沟通', content: '与客户CTO张明通话，讨论云平台部署需求和预算。', activityDate: daysAgo(7) },
  { type: 'meeting', subject: '项目方案演示', content: '在腾讯总部进行了2小时的方案演示，客户反馈积极。', activityDate: daysAgo(5) },
  { type: 'email', subject: '报价单发送', content: '已发送正式报价单和技术方案书。', activityDate: daysAgo(3) },
  { type: 'visit', subject: '现场调研', content: '前往制造集团工厂进行现场调研，了解业务流程。', activityDate: daysAgo(2) },
  { type: 'demo', subject: '产品演示', content: '为医疗科技演示信息系统核心功能。', activityDate: daysAgo(1) },
];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export async function seedCrmData(db: Database): Promise<{ created: number }> {
  let created = 0;

  const existingCount = await db.getRepository('crmCustomers').count();
  if (existingCount > 0) {
    return { created: 0 };
  }

  const customers: any[] = [];
  for (const c of SAMPLE_CUSTOMERS) {
    const record = await db.getRepository('crmCustomers').create({ values: c });
    customers.push(record);
    created++;
  }

  for (let i = 0; i < SAMPLE_CONTACTS.length; i++) {
    const customerId = customers[i % customers.length]?.id;
    await db.getRepository('crmContacts').create({
      values: { ...SAMPLE_CONTACTS[i], customerId },
    });
    created++;
  }

  for (let i = 0; i < SAMPLE_DEALS.length; i++) {
    const customerId = customers[i % customers.length]?.id;
    const contactId = i < SAMPLE_CONTACTS.length ? i + 1 : null;
    const expectedCloseDate = new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000);
    await db.getRepository('crmDeals').create({
      values: {
        ...SAMPLE_DEALS[i],
        customerId,
        contactId,
        expectedCloseDate,
        weightedAmount: SAMPLE_DEALS[i].amount * (SAMPLE_DEALS[i].probability / 100),
      },
    });
    created++;
  }

  for (let i = 0; i < SAMPLE_ACTIVITIES.length; i++) {
    const customerId = customers[i % customers.length]?.id;
    await db.getRepository('crmActivities').create({
      values: { ...SAMPLE_ACTIVITIES[i], customerId },
    });
    created++;
  }

  return { created };
}

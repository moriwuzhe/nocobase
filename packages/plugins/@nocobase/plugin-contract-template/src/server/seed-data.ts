/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86400000); }

export async function seedContractData(db: Database): Promise<{ created: number }> {
  let created = 0;
  if ((await db.getRepository('contracts').count()) > 0) return { created: 0 };

  const contracts = [
    { title: '年度IT服务合同', type: 'service', partyA: '本公司', partyB: '华为技术有限公司', amount: 500000, status: 'active', signDate: daysAgo(30), startDate: daysAgo(30), endDate: daysFromNow(335) },
    { title: '办公设备采购合同', type: 'purchase', partyA: '本公司', partyB: '联想集团', amount: 120000, status: 'signed', signDate: daysAgo(10), startDate: daysAgo(5), endDate: daysFromNow(60) },
    { title: '软件开发外包合同', type: 'service', partyA: '本公司', partyB: '某科技公司', amount: 300000, status: 'draft', startDate: daysFromNow(15), endDate: daysFromNow(180) },
    { title: '保密协议 - 合作方A', type: 'nda', partyA: '本公司', partyB: '某合作伙伴', amount: 0, status: 'active', signDate: daysAgo(90), startDate: daysAgo(90), endDate: daysFromNow(275) },
    { title: '年度物业租赁合同', type: 'other', partyA: '物业方', partyB: '本公司', amount: 360000, status: 'expired', signDate: daysAgo(400), startDate: daysAgo(400), endDate: daysAgo(35) },
  ];
  for (const c of contracts) { await db.getRepository('contracts').create({ values: c }); created++; }
  return { created };
}

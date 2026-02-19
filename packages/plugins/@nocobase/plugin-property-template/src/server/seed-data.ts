import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('propOwners').count()) > 0) return { created: 0 };
  let created = 0;
  const owners = [
    { name: '张先生', phone: '13900001111', unit: 'A-1201', building: 'A栋', area: 120, status: 'active' },
    { name: '李女士', phone: '13900002222', unit: 'B-0803', building: 'B栋', area: 89, status: 'active' },
    { name: '王先生', phone: '13900003333', unit: 'A-0501', building: 'A栋', area: 145, status: 'active' },
  ];
  for (const o of owners) { await db.getRepository('propOwners').create({ values: o }); created++; }
  const repairs = [
    { description: '卫生间漏水', category: '水电', status: 'pending', priority: 'high' },
    { description: '电梯异响', category: '公共设施', status: 'in_progress', priority: 'urgent' },
    { description: '门禁卡失效', category: '安防', status: 'completed', priority: 'low' },
  ];
  for (const r of repairs) { await db.getRepository('propRepairRequests').create({ values: r }); created++; }
  return { created };
}

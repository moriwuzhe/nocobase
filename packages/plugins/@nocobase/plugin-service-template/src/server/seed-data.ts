import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('serviceRequests').count()) > 0) return { created: 0 };
  let created = 0;
  const requests = [
    { title: '空调不制冷', type: 'repair', status: 'open', priority: 'high', description: '3楼会议室空调无法制冷' },
    { title: '笔记本键盘故障', type: 'warranty', status: 'in_progress', priority: 'medium', description: '笔记本部分按键失灵，在保修期内' },
    { title: '退换货申请', type: 'return', status: 'resolved', priority: 'low', description: '客户要求退换上月购买的产品' },
  ];
  for (const r of requests) { await db.getRepository('serviceRequests').create({ values: r }); created++; }
  return { created };
}

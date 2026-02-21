import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('members').count()) > 0) return { created: 0 };
  let created = 0;
  const members = [
    { name: '王小明', phone: '13900001111', level: 'gold', points: 8500, balance: 2000, status: 'active' },
    { name: '李丽丽', phone: '13900002222', level: 'platinum', points: 25000, balance: 5000, status: 'active' },
    { name: '张大山', phone: '13900003333', level: 'silver', points: 3200, balance: 500, status: 'active' },
    { name: '赵小红', phone: '13900004444', level: 'normal', points: 800, balance: 0, status: 'active' },
    { name: '刘建国', phone: '13900005555', level: 'diamond', points: 52000, balance: 10000, status: 'active' },
  ];
  for (const m of members) { await db.getRepository('members').create({ values: m }); created++; }
  return { created };
}

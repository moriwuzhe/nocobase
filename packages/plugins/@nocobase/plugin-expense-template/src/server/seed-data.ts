import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('expenseClaims').count()) > 0) return { created: 0 };
  let created = 0;
  const claims = [
    { title: '北京出差差旅费', totalAmount: 3580, status: 'approved' },
    { title: '客户招待餐费', totalAmount: 860, status: 'pending' },
    { title: '办公用品采购', totalAmount: 450, status: 'paid' },
    { title: '培训交通费', totalAmount: 220, status: 'draft' },
  ];
  for (const c of claims) { await db.getRepository('expenseClaims').create({ values: c }); created++; }
  return { created };
}

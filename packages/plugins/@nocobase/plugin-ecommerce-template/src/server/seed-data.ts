import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('ecOrders').count()) > 0) return { created: 0 };
  let created = 0;
  const orders = [
    { totalAmount: 299, status: 'completed', paymentMethod: 'wechat' },
    { totalAmount: 1580, status: 'shipped', paymentMethod: 'alipay' },
    { totalAmount: 89, status: 'paid', paymentMethod: 'wechat' },
    { totalAmount: 4999, status: 'pending_payment', paymentMethod: null },
    { totalAmount: 650, status: 'refunded', paymentMethod: 'alipay' },
  ];
  for (const o of orders) { await db.getRepository('ecOrders').create({ values: o }); created++; }
  return { created };
}

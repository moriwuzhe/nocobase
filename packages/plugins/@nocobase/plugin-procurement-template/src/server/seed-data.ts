import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('procSuppliers').count()) > 0) return { created: 0 };
  let created = 0;
  const suppliers = [
    { name: '联想集团', contactPerson: '张经理', phone: '010-88881111', email: 'zhang@lenovo.com', category: '电子设备', rating: 'A' },
    { name: '得力办公', contactPerson: '李经理', phone: '0574-88882222', email: 'li@deli.com', category: '办公用品', rating: 'B' },
    { name: '顺丰速运', contactPerson: '王主管', phone: '400-811-1111', email: 'wang@sf.com', category: '物流服务', rating: 'A' },
  ];
  for (const s of suppliers) { await db.getRepository('procSuppliers').create({ values: s }); created++; }
  const orders = [
    { title: '办公电脑采购', totalAmount: 85000, status: 'approved' },
    { title: '打印耗材补充', totalAmount: 3200, status: 'received' },
    { title: '服务器设备采购', totalAmount: 250000, status: 'pending' },
  ];
  for (const o of orders) { await db.getRepository('procPurchaseOrders').create({ values: o }); created++; }
  return { created };
}

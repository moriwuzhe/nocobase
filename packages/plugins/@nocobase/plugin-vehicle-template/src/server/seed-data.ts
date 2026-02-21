import { Database } from '@nocobase/database';
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86400000); }
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('vehicles').count()) > 0) return { created: 0 };
  let created = 0;
  const vehicles = [
    { plateNumber: '沪A12345', brand: '丰田', model: '凯美瑞', status: 'active', department: '销售部', insuranceExpiry: daysFromNow(120), nextInspectionDate: daysFromNow(200) },
    { plateNumber: '沪B67890', brand: '大众', model: '帕萨特', status: 'active', department: '行政部', insuranceExpiry: daysFromNow(25), nextInspectionDate: daysFromNow(90) },
    { plateNumber: '沪C11111', brand: '比亚迪', model: '汉EV', status: 'maintenance', department: '技术部', insuranceExpiry: daysFromNow(180), nextInspectionDate: daysFromNow(300) },
    { plateNumber: '京D22222', brand: '别克', model: 'GL8', status: 'active', department: '管理层', insuranceExpiry: daysAgo(10), nextInspectionDate: daysFromNow(60) },
  ];
  for (const v of vehicles) { await db.getRepository('vehicles').create({ values: v }); created++; }
  return { created };
}

import { Database } from '@nocobase/database';
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86400000); }
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('eqEquipment').count()) > 0) return { created: 0 };
  let created = 0;
  const equipment = [
    { name: '数控车床 CNC-001', model: 'Haas ST-10', location: '车间A', status: 'running', purchaseDate: daysAgo(365), lastMaintenanceDate: daysAgo(30), nextMaintenanceDate: daysFromNow(60) },
    { name: '激光切割机 LC-002', model: 'Trumpf 3030', location: '车间B', status: 'running', purchaseDate: daysAgo(200), lastMaintenanceDate: daysAgo(15), nextMaintenanceDate: daysFromNow(75) },
    { name: '3D打印机 FDM-001', model: 'Stratasys F370', location: '实验室', status: 'idle', purchaseDate: daysAgo(500), lastMaintenanceDate: daysAgo(90), nextMaintenanceDate: daysFromNow(5) },
    { name: '空压机 AC-001', model: 'Atlas Copco GA30', location: '动力间', status: 'maintenance', purchaseDate: daysAgo(730), lastMaintenanceDate: daysAgo(3) },
  ];
  for (const e of equipment) { await db.getRepository('eqEquipment').create({ values: e }); created++; }
  return { created };
}

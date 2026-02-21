import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('recJobPostings').count()) > 0) return { created: 0 };
  let created = 0;
  const jobs = [
    { title: '高级前端工程师', department: '技术部', location: '上海', salary: '25K-40K', status: 'published', headcount: 2 },
    { title: '产品经理', department: '产品部', location: '北京', salary: '30K-50K', status: 'published', headcount: 1 },
    { title: '销售主管', department: '销售部', location: '广州', salary: '15K-25K', status: 'published', headcount: 3 },
    { title: 'UI设计师', department: '设计部', location: '上海', salary: '18K-28K', status: 'closed', headcount: 1 },
  ];
  for (const j of jobs) { await db.getRepository('recJobPostings').create({ values: j }); created++; }
  const candidates = [
    { name: '张三', phone: '13800001111', email: 'zhangsan@email.com', stage: 'interview', source: 'boss' },
    { name: '李四', phone: '13800002222', email: 'lisi@email.com', stage: 'screening', source: 'linkedin' },
    { name: '王五', phone: '13800003333', email: 'wangwu@email.com', stage: 'new', source: 'referral' },
    { name: '赵六', phone: '13800004444', email: 'zhaoliu@email.com', stage: 'hired', source: 'boss' },
  ];
  for (const c of candidates) { await db.getRepository('recCandidates').create({ values: c }); created++; }
  return { created };
}

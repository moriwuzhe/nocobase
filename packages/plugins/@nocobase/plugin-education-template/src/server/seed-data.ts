import { Database } from '@nocobase/database';
export async function seedData(db: Database): Promise<{ created: number }> {
  if ((await db.getRepository('eduStudents').count()) > 0) return { created: 0 };
  let created = 0;
  const students = [
    { name: '张小华', grade: '高一', className: '1班', gender: 'male', phone: '13900001111', status: 'active' },
    { name: '李美玲', grade: '高一', className: '2班', gender: 'female', phone: '13900002222', status: 'active' },
    { name: '王大力', grade: '高二', className: '1班', gender: 'male', phone: '13900003333', status: 'active' },
    { name: '赵欣欣', grade: '高二', className: '3班', gender: 'female', phone: '13900004444', status: 'active' },
    { name: '陈小刚', grade: '高三', className: '1班', gender: 'male', phone: '13900005555', status: 'graduated' },
  ];
  for (const s of students) { await db.getRepository('eduStudents').create({ values: s }); created++; }
  const courses = [
    { name: '高等数学', code: 'MATH101', teacher: '张老师', credits: 4, status: 'active' },
    { name: '英语精读', code: 'ENG101', teacher: '李老师', credits: 3, status: 'active' },
    { name: '物理实验', code: 'PHY201', teacher: '王老师', credits: 2, status: 'active' },
  ];
  for (const c of courses) { await db.getRepository('eduCourses').create({ values: c }); created++; }
  return { created };
}

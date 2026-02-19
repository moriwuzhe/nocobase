/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

const SAMPLE_EMPLOYEES = [
  { name: '张伟', gender: 'male', department: '技术部', position: '技术总监', level: 'director', status: 'active', employmentType: 'fulltime', phone: '13900001111', email: 'zhangwei@company.com', education: 'master', hireDate: daysAgo(1200) },
  { name: '李芳', gender: 'female', department: '技术部', position: '高级前端工程师', level: 'senior', status: 'active', employmentType: 'fulltime', phone: '13900002222', email: 'lifang@company.com', education: 'bachelor', hireDate: daysAgo(800) },
  { name: '王磊', gender: 'male', department: '技术部', position: '后端工程师', level: 'mid', status: 'active', employmentType: 'fulltime', phone: '13900003333', email: 'wanglei@company.com', education: 'bachelor', hireDate: daysAgo(400) },
  { name: '赵静', gender: 'female', department: '产品部', position: '产品经理', level: 'senior', status: 'active', employmentType: 'fulltime', phone: '13900004444', email: 'zhaojing@company.com', education: 'master', hireDate: daysAgo(600) },
  { name: '刘洋', gender: 'male', department: '销售部', position: '销售总监', level: 'director', status: 'active', employmentType: 'fulltime', phone: '13900005555', email: 'liuyang@company.com', education: 'bachelor', hireDate: daysAgo(1500) },
  { name: '陈晨', gender: 'male', department: '销售部', position: '大客户经理', level: 'senior', status: 'active', employmentType: 'fulltime', phone: '13900006666', email: 'chenchen@company.com', education: 'bachelor', hireDate: daysAgo(300) },
  { name: '孙悦', gender: 'female', department: '人事部', position: 'HR经理', level: 'manager', status: 'active', employmentType: 'fulltime', phone: '13900007777', email: 'sunyue@company.com', education: 'master', hireDate: daysAgo(900) },
  { name: '周明', gender: 'male', department: '财务部', position: '财务主管', level: 'lead', status: 'active', employmentType: 'fulltime', phone: '13900008888', email: 'zhouming@company.com', education: 'bachelor', hireDate: daysAgo(700) },
  { name: '吴婷', gender: 'female', department: '市场部', position: '市场专员', level: 'junior', status: 'probation', employmentType: 'fulltime', phone: '13900009999', email: 'wuting@company.com', education: 'bachelor', hireDate: daysAgo(30), probationEndDate: daysFromNow(60) },
  { name: '郑浩', gender: 'male', department: '技术部', position: '实习生', level: 'junior', status: 'active', employmentType: 'intern', phone: '13900010000', email: 'zhenghao@company.com', education: 'bachelor', hireDate: daysAgo(45) },
];

const LEAVE_TYPES = ['annual', 'sick', 'personal', 'marriage', 'maternity'];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

export async function seedHrData(db: Database): Promise<{ created: number }> {
  let created = 0;

  const existingCount = await db.getRepository('hrEmployees').count();
  if (existingCount > 0) {
    return { created: 0 };
  }

  const employees: any[] = [];
  for (const e of SAMPLE_EMPLOYEES) {
    const record = await db.getRepository('hrEmployees').create({ values: e });
    employees.push(record);
    created++;
  }

  const leaveRequests = [
    { type: 'annual', startDate: daysFromNow(5), endDate: daysFromNow(7), reason: '家庭旅行', status: 'pending' },
    { type: 'sick', startDate: daysAgo(3), endDate: daysAgo(2), reason: '感冒发烧', status: 'approved' },
    { type: 'personal', startDate: daysFromNow(10), endDate: daysFromNow(10), reason: '搬家', status: 'pending' },
  ];

  for (let i = 0; i < leaveRequests.length; i++) {
    const employeeId = employees[i + 1]?.id;
    if (employeeId) {
      const req = leaveRequests[i];
      const days = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      await db.getRepository('hrLeaveRequests').create({
        values: { ...req, employeeId, days },
      });
      created++;
    }
  }

  return { created };
}

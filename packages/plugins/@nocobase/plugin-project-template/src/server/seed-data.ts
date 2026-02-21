/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

const SAMPLE_PROJECTS = [
  {
    name: '企业官网改版项目',
    type: 'software',
    status: 'in_progress',
    priority: 'high',
    budget: 200000,
    actualCost: 85000,
    progress: 45,
    startDate: daysAgo(30),
    endDate: daysFromNow(60),
  },
  {
    name: '移动端 App 开发',
    type: 'software',
    status: 'planning',
    priority: 'critical',
    budget: 500000,
    actualCost: 0,
    progress: 5,
    startDate: daysFromNow(7),
    endDate: daysFromNow(120),
  },
  {
    name: '年度市场推广计划',
    type: 'marketing',
    status: 'in_progress',
    priority: 'medium',
    budget: 150000,
    actualCost: 62000,
    progress: 60,
    startDate: daysAgo(60),
    endDate: daysFromNow(30),
  },
  {
    name: '办公室装修工程',
    type: 'infrastructure',
    status: 'completed',
    priority: 'medium',
    budget: 300000,
    actualCost: 280000,
    progress: 100,
    startDate: daysAgo(90),
    endDate: daysAgo(10),
    actualEndDate: daysAgo(5),
  },
];

const SAMPLE_TASKS = [
  { title: '需求分析文档编写', type: 'task', status: 'done', priority: 'high', estimatedHours: 16, actualHours: 20, progress: 100 },
  { title: 'UI/UX 设计稿', type: 'task', status: 'in_progress', priority: 'high', estimatedHours: 40, actualHours: 25, progress: 60 },
  { title: '首页前端开发', type: 'feature', status: 'in_progress', priority: 'medium', estimatedHours: 24, actualHours: 10, progress: 40 },
  { title: '后端 API 接口开发', type: 'task', status: 'todo', priority: 'high', estimatedHours: 32, actualHours: 0, progress: 0 },
  { title: '登录模块样式错位', type: 'bug', status: 'in_review', priority: 'urgent', estimatedHours: 4, actualHours: 3, progress: 90 },
  { title: '性能优化 - 首屏加载', type: 'improvement', status: 'todo', priority: 'medium', estimatedHours: 16, actualHours: 0, progress: 0 },
  { title: '集成测试编写', type: 'task', status: 'todo', priority: 'low', estimatedHours: 24, actualHours: 0, progress: 0 },
  { title: 'App 原型设计', type: 'task', status: 'in_progress', priority: 'high', estimatedHours: 20, actualHours: 8, progress: 35 },
  { title: '广告投放方案', type: 'task', status: 'done', priority: 'medium', estimatedHours: 8, actualHours: 6, progress: 100 },
  { title: '社交媒体内容制作', type: 'task', status: 'in_progress', priority: 'low', estimatedHours: 12, actualHours: 5, progress: 40 },
];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

export async function seedProjectData(db: Database): Promise<{ created: number }> {
  let created = 0;

  const existingCount = await db.getRepository('pmProjects').count();
  if (existingCount > 0) {
    return { created: 0 };
  }

  const projects: any[] = [];
  for (const p of SAMPLE_PROJECTS) {
    const record = await db.getRepository('pmProjects').create({ values: p });
    projects.push(record);
    created++;
  }

  for (let i = 0; i < SAMPLE_TASKS.length; i++) {
    const projectId = projects[i % projects.length]?.id;
    const dueDate = daysFromNow(7 + i * 3);
    await db.getRepository('pmTasks').create({
      values: { ...SAMPLE_TASKS[i], projectId, dueDate },
    });
    created++;
  }

  return { created };
}

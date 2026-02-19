/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database } from '@nocobase/database';

function daysAgo(n: number): Date { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }

export async function seedTicketData(db: Database): Promise<{ created: number }> {
  let created = 0;
  if ((await db.getRepository('tickets').count()) > 0) return { created: 0 };

  const tickets = [
    { title: '无法登录系统', description: '输入正确密码后提示"认证失败"，清除缓存后依然无法登录。', priority: 'urgent', status: 'in_progress', category: '账户问题' },
    { title: '报表导出失败', description: '导出超过1000行的数据时，页面提示超时错误。', priority: 'high', status: 'open', category: '功能异常' },
    { title: '页面加载缓慢', description: '仪表盘页面加载需要10秒以上，其他页面正常。', priority: 'medium', status: 'open', category: '性能问题' },
    { title: '希望增加批量导入功能', description: '客户希望能通过Excel批量导入产品数据。', priority: 'low', status: 'open', category: '需求建议' },
    { title: '移动端显示异常', description: 'iPhone 15上表格列显示不全，需要横向滚动。', priority: 'medium', status: 'resolved', category: '界面问题', resolvedAt: daysAgo(1), resolutionHours: 4.5 },
    { title: '邮件通知延迟', description: '审批通知邮件发送延迟约30分钟。', priority: 'high', status: 'resolved', category: '功能异常', resolvedAt: daysAgo(2), resolutionHours: 2.0 },
    { title: '日期选择器时区问题', description: '选择日期后，保存的时间偏移了8小时。', priority: 'high', status: 'closed', category: '功能异常', resolvedAt: daysAgo(5), closedAt: daysAgo(4), resolutionHours: 6.0 },
  ];
  for (const t of tickets) { await db.getRepository('tickets').create({ values: t }); created++; }

  const kbArticles = [
    { title: '如何重置密码', content: '<h3>重置密码步骤</h3><ol><li>点击登录页面的"忘记密码"</li><li>输入注册邮箱</li><li>检查邮箱中的重置链接</li><li>设置新密码</li></ol>', category: '账户管理', status: 'published' },
    { title: '数据导出操作指南', content: '<h3>导出数据</h3><p>在列表页面点击右上角"导出"按钮，选择需要导出的字段和格式（Excel/CSV），点击确认即可。</p><p><strong>注意：</strong>单次导出上限为5000条。</p>', category: '操作指南', status: 'published' },
    { title: '常见错误代码说明', content: '<h3>错误代码</h3><ul><li><strong>401</strong>：登录已过期，请重新登录</li><li><strong>403</strong>：权限不足，请联系管理员</li><li><strong>500</strong>：服务器错误，请稍后重试</li></ul>', category: '故障排查', status: 'published' },
    { title: '移动端使用指南', content: '<p>NocoBase支持移动端浏览器访问，推荐使用Chrome或Safari浏览器。</p>', category: '操作指南', status: 'published' },
  ];
  for (const a of kbArticles) { await db.getRepository('ticketKnowledgeBase').create({ values: a }); created++; }

  return { created };
}

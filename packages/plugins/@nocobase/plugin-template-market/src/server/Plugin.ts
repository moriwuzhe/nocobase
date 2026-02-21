/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * Template catalog — the server-side registry of all available templates.
 * Provides API for listing templates and enabling/disabling them.
 */

export interface TemplateDef {
  name: string;
  pluginName: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  category: string;
  collections: string[];
  tags: string[];
}

const TEMPLATE_CATALOG: TemplateDef[] = [
  { name: 'crm', pluginName: '@nocobase/plugin-crm-template', title: 'CRM', titleZh: '客户关系管理', description: 'Full CRM with customers, contacts, deals pipeline, activities, quotes, campaigns, and sales targets.', descriptionZh: '完整的CRM系统：客户、联系人、商机管道、跟进活动、报价、营销活动、销售目标管理。', icon: 'TeamOutlined', category: 'sales', collections: ['crmCustomers', 'crmContacts', 'crmDeals', 'crmActivities', 'crmProducts', 'crmQuotes', 'crmQuoteItems', 'crmCampaigns', 'crmContracts', 'crmPayments', 'crmCompetitors', 'crmSalesTargets', 'crmEmailTemplates', 'crmLeads'], tags: ['sales', 'customer', 'pipeline'] },
  { name: 'ecommerce', pluginName: '@nocobase/plugin-ecommerce-template', title: 'E-commerce', titleZh: '电商订单管理', description: 'Online store: orders, products, coupons, shipping, reviews, refunds.', descriptionZh: '电商系统：订单、商品、优惠券、物流、评价、退款管理。', icon: 'ShopOutlined', category: 'sales', collections: ['ecOrders', 'ecOrderItems', 'ecProducts', 'ecCoupons', 'ecReviews', 'ecRefunds'], tags: ['sales', 'orders', 'shop'] },
  { name: 'membership', pluginName: '@nocobase/plugin-membership-template', title: 'Membership', titleZh: '会员管理', description: 'Member tiers, points system, transactions, and tier rules.', descriptionZh: '会员等级、积分体系、消费记录、等级规则管理。', icon: 'CrownOutlined', category: 'sales', collections: ['members', 'memberTransactions', 'memberTierRules'], tags: ['sales', 'membership', 'loyalty'] },
  { name: 'procurement', pluginName: '@nocobase/plugin-procurement-template', title: 'Procurement', titleZh: '采购管理', description: 'Purchase orders, suppliers, receiving, and payment tracking.', descriptionZh: '采购订单、供应商、收货验收、付款跟踪管理。', icon: 'ShoppingCartOutlined', category: 'supply', collections: ['procPurchaseOrders', 'procOrderItems', 'procSuppliers', 'procReceiving', 'procPayments'], tags: ['procurement', 'purchasing'] },
  { name: 'inventory', pluginName: '@nocobase/plugin-inventory-template', title: 'Inventory', titleZh: '进销存管理', description: 'Products, warehouses, stock movements, and stock checks.', descriptionZh: '商品、仓库、出入库、盘点管理。', icon: 'DatabaseOutlined', category: 'supply', collections: ['invProducts', 'invStockMovements', 'invWarehouses', 'invStockCheck'], tags: ['inventory', 'stock', 'warehouse'] },
  { name: 'contract', pluginName: '@nocobase/plugin-contract-template', title: 'Contracts', titleZh: '合同管理', description: 'Contract lifecycle: drafting, signing, execution, payment tracking.', descriptionZh: '合同全生命周期：起草、签署、执行、回款跟踪。', icon: 'FileProtectOutlined', category: 'finance', collections: ['contracts', 'contractPayments', 'contractTemplates'], tags: ['contract', 'legal'] },
  { name: 'expense', pluginName: '@nocobase/plugin-expense-template', title: 'Expenses', titleZh: '报销管理', description: 'Expense claims, items, categories, and approval workflow.', descriptionZh: '报销申请、费用明细、费用类别、审批流程。', icon: 'AccountBookOutlined', category: 'finance', collections: ['expenseClaims', 'expenseItems', 'expenseCategories'], tags: ['expense', 'finance', 'reimbursement'] },
  { name: 'hr', pluginName: '@nocobase/plugin-hr-template', title: 'HR', titleZh: '人力资源管理', description: 'Employees, leave, attendance, onboarding, performance, salary, training.', descriptionZh: '员工档案、请假、考勤、入职、绩效、薪资、培训管理。', icon: 'IdcardOutlined', category: 'hr', collections: ['hrEmployees', 'hrLeaveRequests', 'hrAttendance', 'hrOnboarding', 'hrPerformance', 'hrSalary', 'hrTraining'], tags: ['hr', 'employee', 'payroll'] },
  { name: 'recruitment', pluginName: '@nocobase/plugin-recruitment-template', title: 'Recruitment', titleZh: '招聘管理', description: 'Job postings, candidates, interviews, and offers.', descriptionZh: '职位发布、候选人管理、面试安排、Offer管理。', icon: 'SolutionOutlined', category: 'hr', collections: ['recJobPostings', 'recCandidates', 'recInterviews', 'recOffers'], tags: ['hr', 'hiring', 'talent'] },
  { name: 'oa', pluginName: '@nocobase/plugin-oa-template', title: 'Office Automation', titleZh: 'OA 协同办公', description: 'Announcements, meetings, assets, visitors, work reports.', descriptionZh: '公告、会议室预约、固定资产、访客登记、工作日报。', icon: 'DesktopOutlined', category: 'office', collections: ['oaAnnouncements', 'oaMeetingRooms', 'oaMeetingBookings', 'oaAssets', 'oaVisitors', 'oaWorkReports'], tags: ['office', 'oa', 'collaboration'] },
  { name: 'project', pluginName: '@nocobase/plugin-project-template', title: 'Project Management', titleZh: '项目管理', description: 'Projects, tasks, milestones, timesheets, and risk tracking.', descriptionZh: '项目、任务、里程碑、工时记录、风险管理。', icon: 'ProjectOutlined', category: 'office', collections: ['pmProjects', 'pmTasks', 'pmMilestones', 'pmTimesheets', 'pmRisks'], tags: ['project', 'task', 'agile'] },
  { name: 'ticket', pluginName: '@nocobase/plugin-ticket-template', title: 'Helpdesk', titleZh: '工单系统', description: 'Support tickets, SLA management, knowledge base, and replies.', descriptionZh: '工单管理、SLA管控、知识库、工单回复。', icon: 'FileTextOutlined', category: 'service', collections: ['tickets', 'ticketKnowledgeBase', 'ticketSLA', 'ticketReplies'], tags: ['ticket', 'support', 'helpdesk'] },
  { name: 'service', pluginName: '@nocobase/plugin-service-template', title: 'After-sales', titleZh: '售后服务', description: 'Service requests, warranties, spare parts.', descriptionZh: '售后工单、保修管理、备件管理。', icon: 'CustomerServiceOutlined', category: 'service', collections: ['serviceRequests', 'serviceWarranties', 'serviceParts'], tags: ['service', 'warranty', 'repair'] },
  { name: 'vehicle', pluginName: '@nocobase/plugin-vehicle-template', title: 'Vehicle Fleet', titleZh: '车辆管理', description: 'Vehicle fleet, insurance, maintenance, and usage logs.', descriptionZh: '车辆台账、保险管理、维保记录、用车日志。', icon: 'CarOutlined', category: 'assets', collections: ['vehicles', 'vehicleMaintenance', 'vehicleUsageLogs'], tags: ['vehicle', 'fleet', 'transport'] },
  { name: 'equipment', pluginName: '@nocobase/plugin-equipment-template', title: 'Equipment', titleZh: '设备管理', description: 'Equipment register, work orders, spare parts.', descriptionZh: '设备台账、维修工单、备件管理。', icon: 'ToolOutlined', category: 'assets', collections: ['eqEquipment', 'eqWorkOrders', 'eqSpareParts'], tags: ['equipment', 'maintenance', 'asset'] },
  { name: 'property', pluginName: '@nocobase/plugin-property-template', title: 'Property', titleZh: '物业管理', description: 'Owners, repair requests, fees, and inspections.', descriptionZh: '业主管理、报修工单、物业缴费、巡检记录。', icon: 'HomeOutlined', category: 'community', collections: ['propOwners', 'propRepairRequests', 'propFees', 'propInspections'], tags: ['property', 'community', 'real-estate'] },
  { name: 'education', pluginName: '@nocobase/plugin-education-template', title: 'Education', titleZh: '教务管理', description: 'Students, courses, grades, schedule, payments.', descriptionZh: '学生、课程、成绩、排课、缴费管理。', icon: 'ReadOutlined', category: 'community', collections: ['eduStudents', 'eduCourses', 'eduGrades', 'eduSchedule', 'eduPayments'], tags: ['education', 'school', 'lms'] },
];

export default class PluginTemplateMarketServer extends Plugin {
  async load() {
    this.app.resourceManager.define({
      name: 'templateMarket',
      actions: {
        list: this.handleList.bind(this),
        getDetail: this.handleGetDetail.bind(this),
        activate: this.handleActivate.bind(this),
        deactivate: this.handleDeactivate.bind(this),
        reseed: this.handleReseed.bind(this),
        stats: this.handleStats.bind(this),
      },
    });

    this.app.acl.allow('templateMarket', 'list', 'loggedIn');
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['templateMarket:*'],
    });
  }

  private async handleList(ctx: any, next: any) {
    const { category, search } = ctx.action.params;

    let templates = [...TEMPLATE_CATALOG];

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }
    if (search) {
      const kw = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(kw) ||
          t.titleZh.includes(kw) ||
          t.tags.some((tag) => tag.includes(kw)),
      );
    }

    // Check which are currently enabled
    const result = templates.map((t) => {
      const plugin = this.app.pm.get(t.pluginName) as any;
      return {
        ...t,
        enabled: !!plugin?.enabled,
        installed: !!plugin,
      };
    });

    ctx.body = result;
    await next();
  }

  private async handleGetDetail(ctx: any, next: any) {
    const { name } = ctx.action.params;
    const template = TEMPLATE_CATALOG.find((t) => t.name === name);
    if (!template) return ctx.throw(404, 'Template not found');

    const plugin = this.app.pm.get(template.pluginName) as any;
    ctx.body = {
      ...template,
      enabled: !!plugin?.enabled,
      installed: !!plugin,
    };
    await next();
  }

  private async handleActivate(ctx: any, next: any) {
    const { name } = ctx.action.params.values || ctx.action.params;
    const template = TEMPLATE_CATALOG.find((t) => t.name === name);
    if (!template) return ctx.throw(404, 'Template not found');

    try {
      await this.app.pm.enable(template.pluginName);
      ctx.body = { success: true, message: `${template.title} activated` };
    } catch (err: any) {
      ctx.body = { success: false, error: err.message };
    }
    await next();
  }

  private async handleReseed(ctx: any, next: any) {
    const { name } = ctx.action.params.values || ctx.action.params;
    const template = TEMPLATE_CATALOG.find((t) => t.name === name);
    if (!template) return ctx.throw(404, 'Template not found');

    const plugin = this.app.pm.get(template.pluginName) as any;
    if (!plugin) {
      ctx.body = { success: false, error: 'Plugin not installed' };
      await next();
      return;
    }

    try {
      if (typeof plugin.install === 'function') {
        await plugin.install();
        ctx.body = { success: true, message: `Sample data for ${template.title} has been re-seeded` };
      } else {
        ctx.body = { success: false, error: 'This template does not support re-seeding' };
      }
    } catch (err: any) {
      ctx.body = { success: false, error: err.message };
    }
    await next();
  }

  private async handleStats(ctx: any, next: any) {
    const enabled = TEMPLATE_CATALOG.filter((t) => {
      const plugin = this.app.pm.get(t.pluginName) as any;
      return !!plugin?.enabled;
    });

    const byCategory: Record<string, { total: number; enabled: number }> = {};
    TEMPLATE_CATALOG.forEach((t) => {
      if (!byCategory[t.category]) byCategory[t.category] = { total: 0, enabled: 0 };
      byCategory[t.category].total++;
      const plugin = this.app.pm.get(t.pluginName) as any;
      if (plugin?.enabled) byCategory[t.category].enabled++;
    });

    ctx.body = {
      total: TEMPLATE_CATALOG.length,
      enabled: enabled.length,
      byCategory,
      templates: enabled.map((t) => ({ name: t.name, title: t.titleZh, category: t.category })),
    };
    await next();
  }

  private async handleDeactivate(ctx: any, next: any) {
    const { name } = ctx.action.params.values || ctx.action.params;
    const template = TEMPLATE_CATALOG.find((t) => t.name === name);
    if (!template) return ctx.throw(404, 'Template not found');

    try {
      await this.app.pm.disable(template.pluginName);
      ctx.body = { success: true, message: `${template.title} deactivated` };
    } catch (err: any) {
      ctx.body = { success: false, error: err.message };
    }
    await next();
  }
}

export { TEMPLATE_CATALOG };

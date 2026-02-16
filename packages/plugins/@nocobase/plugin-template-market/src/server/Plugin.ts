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
  { name: 'crm', pluginName: '@nocobase/plugin-crm-template', title: 'CRM', titleZh: '客户管理', description: 'Customer relationship management with sales pipeline.', descriptionZh: '客户、联系人、商机、跟进活动管理。', icon: 'TeamOutlined', category: 'sales', collections: ['crmCustomers', 'crmContacts', 'crmDeals', 'crmActivities'], tags: ['sales', 'customer'] },
  { name: 'ecommerce', pluginName: '@nocobase/plugin-ecommerce-template', title: 'E-commerce', titleZh: '电商订单', description: 'Online orders with payment, shipping, and tracking.', descriptionZh: '电商订单、支付、物流追踪管理。', icon: 'ShopOutlined', category: 'sales', collections: ['ecOrders'], tags: ['sales', 'orders'] },
  { name: 'membership', pluginName: '@nocobase/plugin-membership-template', title: 'Membership', titleZh: '会员管理', description: 'Member tiers, points, card balance.', descriptionZh: '会员等级、积分、储值卡管理。', icon: 'CrownOutlined', category: 'sales', collections: ['members'], tags: ['sales', 'membership'] },
  { name: 'procurement', pluginName: '@nocobase/plugin-procurement-template', title: 'Procurement', titleZh: '采购管理', description: 'Purchase orders with approval workflow.', descriptionZh: '采购订单、供应商、审批流程。', icon: 'ShoppingCartOutlined', category: 'supply', collections: ['procPurchaseOrders'], tags: ['procurement'] },
  { name: 'inventory', pluginName: '@nocobase/plugin-inventory-template', title: 'Inventory', titleZh: '进销存', description: 'Product catalog and stock movements.', descriptionZh: '商品目录、库存变动管理。', icon: 'DatabaseOutlined', category: 'supply', collections: ['invProducts', 'invStockMovements'], tags: ['inventory', 'stock'] },
  { name: 'contract', pluginName: '@nocobase/plugin-contract-template', title: 'Contracts', titleZh: '合同管理', description: 'Contract lifecycle management.', descriptionZh: '合同全生命周期管理。', icon: 'FileProtectOutlined', category: 'finance', collections: ['contracts'], tags: ['contract', 'legal'] },
  { name: 'expense', pluginName: '@nocobase/plugin-expense-template', title: 'Expenses', titleZh: '报销管理', description: 'Expense claims with receipt tracking.', descriptionZh: '费用报销、发票管理。', icon: 'AccountBookOutlined', category: 'finance', collections: ['expenseClaims'], tags: ['expense', 'finance'] },
  { name: 'hr', pluginName: '@nocobase/plugin-hr-template', title: 'HR', titleZh: '人事管理', description: 'Employee records, leave, attendance.', descriptionZh: '员工档案、请假、考勤。', icon: 'IdcardOutlined', category: 'hr', collections: ['hrEmployees', 'hrLeaveRequests', 'hrAttendance'], tags: ['hr', 'employee'] },
  { name: 'recruitment', pluginName: '@nocobase/plugin-recruitment-template', title: 'Recruitment', titleZh: '招聘管理', description: 'Job postings and candidate pipeline.', descriptionZh: '职位发布、候选人管道管理。', icon: 'SolutionOutlined', category: 'hr', collections: ['recJobPostings', 'recCandidates'], tags: ['hr', 'hiring'] },
  { name: 'oa', pluginName: '@nocobase/plugin-oa-template', title: 'Office Automation', titleZh: 'OA 办公', description: 'Announcements, meetings, assets.', descriptionZh: '公告、会议室预约、资产管理。', icon: 'DesktopOutlined', category: 'office', collections: ['oaAnnouncements', 'oaMeetingRooms', 'oaMeetingBookings', 'oaAssets'], tags: ['office', 'oa'] },
  { name: 'project', pluginName: '@nocobase/plugin-project-template', title: 'Project Management', titleZh: '项目管理', description: 'Projects and tasks with progress tracking.', descriptionZh: '项目、任务、进度跟踪。', icon: 'ProjectOutlined', category: 'office', collections: ['pmProjects', 'pmTasks'], tags: ['project', 'task'] },
  { name: 'ticket', pluginName: '@nocobase/plugin-ticket-template', title: 'Helpdesk', titleZh: '工单系统', description: 'Support tickets and knowledge base.', descriptionZh: '工单管理、知识库。', icon: 'FileTextOutlined', category: 'service', collections: ['tickets', 'ticketKnowledgeBase'], tags: ['ticket', 'support'] },
  { name: 'service', pluginName: '@nocobase/plugin-service-template', title: 'After-sales', titleZh: '售后服务', description: 'Service requests, warranties, returns.', descriptionZh: '售后工单、保修、退换货。', icon: 'CustomerServiceOutlined', category: 'service', collections: ['serviceRequests'], tags: ['service', 'warranty'] },
  { name: 'vehicle', pluginName: '@nocobase/plugin-vehicle-template', title: 'Vehicle Fleet', titleZh: '车辆管理', description: 'Fleet management with insurance tracking.', descriptionZh: '车辆、保险、年检管理。', icon: 'CarOutlined', category: 'assets', collections: ['vehicles'], tags: ['vehicle', 'fleet'] },
  { name: 'equipment', pluginName: '@nocobase/plugin-equipment-template', title: 'Equipment', titleZh: '设备维保', description: 'Equipment register and maintenance plans.', descriptionZh: '设备台账、保养计划。', icon: 'ToolOutlined', category: 'assets', collections: ['eqEquipment'], tags: ['equipment', 'maintenance'] },
  { name: 'property', pluginName: '@nocobase/plugin-property-template', title: 'Property', titleZh: '物业管理', description: 'Property management with repairs and fees.', descriptionZh: '业主、报修、缴费管理。', icon: 'HomeOutlined', category: 'community', collections: ['propOwners', 'propRepairRequests', 'propFees'], tags: ['property', 'community'] },
  { name: 'education', pluginName: '@nocobase/plugin-education-template', title: 'Education', titleZh: '教育管理', description: 'Students, courses, and grades.', descriptionZh: '学生、课程、成绩管理。', icon: 'ReadOutlined', category: 'community', collections: ['eduStudents', 'eduCourses', 'eduGrades'], tags: ['education', 'school'] },
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

/**
 * Shared i18n keys for built-in templates.
 * Used by TemplateSelector (core) and AppManager (multi-app-manager).
 */
export const TEMPLATE_I18N_KEYS: Record<string, { title: string; description: string }> = {
  'project-management': {
    title: 'Built-in template: Project Management',
    description: 'Built-in template: Project Management description',
  },
  crm: { title: 'Built-in template: CRM', description: 'Built-in template: CRM description' },
  hr: { title: 'Built-in template: HR', description: 'Built-in template: HR description' },
  cms: { title: 'Built-in template: CMS', description: 'Built-in template: CMS description' },
};

/** Maps template highlight text (Chinese) to i18n key for translation */
export const HIGHLIGHT_I18N_KEYS: Record<string, string> = {
  项目规划: 'Project planning',
  任务管理: 'Task management',
  里程碑: 'Milestones',
  风险管理: 'Risk management',
  预算管理: 'Budget management',
  看板视图: 'Kanban view',
  日历视图: 'Calendar view',
  甘特图: 'Gantt chart',
  工作流: 'Workflow',
  批量编辑: 'Bulk edit',
  打印: 'Print',
  数据导入导出: 'Import/Export',
  客户管理: 'Customer management',
  商机追踪: 'Opportunity tracking',
  合同管理: 'Contract management',
  回款管理: 'Payment collection',
  售后工单: 'After-sales tickets',
  组织架构: 'Organization structure',
  员工档案: 'Employee records',
  考勤管理: 'Attendance management',
  请假管理: 'Leave management',
  招聘管理: 'Recruitment',
  培训记录: 'Training records',
  绩效评估: 'Performance evaluation',
  文章管理: 'Article management',
  分类体系: 'Category system',
  标签管理: 'Tag management',
  评论审核: 'Comment moderation',
  页面管理: 'Page management',
  富文本: 'Rich text',
  'URL链接': 'URL link',
};

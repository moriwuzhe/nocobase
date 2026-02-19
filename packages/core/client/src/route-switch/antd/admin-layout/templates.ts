/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// ─── Type definitions ─────────────────────────────────────

export interface FieldExtra {
  showInTable?: boolean;
  showInForm?: boolean;
  required?: boolean;
}

export interface FieldDef {
  name: string;
  type: string;
  interface: string;
  title: string;
  uiSchema?: Record<string, any>;
  showInTable?: boolean;
  showInForm?: boolean;
  required?: boolean;
  [key: string]: any;
}

export interface RelationDef {
  sourceCollection: string;
  name: string;
  type: string;
  interface: string;
  target: string;
  foreignKey: string;
  targetKey: string;
  title: string;
  labelField: string;
  showInTable?: boolean;
  showInForm?: boolean;
}

export interface CollectionDef {
  name: string;
  title: string;
  fields: FieldDef[];
}

export interface KanbanConfig {
  groupField: string;
}

export interface CalendarConfig {
  titleField: string;
  startDateField: string;
  endDateField?: string;
}

export interface GanttConfig {
  titleField: string;
  startField: string;
  endField: string;
  progressField?: string;
}

export interface MenuItemDef {
  type: 'group' | 'page';
  title: string;
  icon?: string;
  collectionName?: string;
  children?: MenuItemDef[];
  kanban?: KanbanConfig;
  calendar?: CalendarConfig;
  gantt?: GanttConfig;
}

export interface WorkflowDef {
  title: string;
  type: string;
  description: string;
  triggerConfig: Record<string, any>;
  nodes: { type: string; title: string; config: Record<string, any> }[];
}

export interface TemplateDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  highlights: string[];
  collections: CollectionDef[];
  relations: RelationDef[];
  menu: MenuItemDef[];
  workflows: WorkflowDef[];
}

// ─── Field helpers ────────────────────────────────────────

const req = (required?: boolean) => (required ? { required: true } : {});

const input = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'string',
  interface: 'input',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Input', ...req(extra?.required) },
  ...extra,
});

const textarea = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'text',
  interface: 'textarea',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Input.TextArea', ...req(extra?.required) },
  showInTable: false,
  ...extra,
});

const richText = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'text',
  interface: 'richText',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'RichText', ...req(extra?.required) },
  showInTable: false,
  ...extra,
});

const url = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'string',
  interface: 'url',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Input.URL', ...req(extra?.required) },
  ...extra,
});

const number = (name: string, title: string, props?: Record<string, any>): FieldDef => ({
  name,
  type: 'float',
  interface: 'number',
  title,
  uiSchema: { type: 'number', title, 'x-component': 'InputNumber', 'x-component-props': { ...props } },
});

const integer = (name: string, title: string, props?: Record<string, any>, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'bigInt',
  interface: 'integer',
  title,
  uiSchema: { type: 'number', title, 'x-component': 'InputNumber', 'x-component-props': { ...props } },
  ...extra,
});

const percent = (name: string, title: string): FieldDef => ({
  name,
  type: 'float',
  interface: 'percent',
  title,
  uiSchema: { type: 'number', title, 'x-component': 'Percent' },
});

const money = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'double',
  interface: 'number',
  title,
  uiSchema: {
    type: 'number',
    title,
    'x-component': 'InputNumber',
    'x-component-props': { addonBefore: '¥', precision: 2 },
    ...req(extra?.required),
  },
  ...extra,
});

const date = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'date',
  interface: 'date',
  title,
  uiSchema: {
    type: 'string',
    title,
    'x-component': 'DatePicker',
    'x-component-props': { dateFormat: 'YYYY-MM-DD' },
    ...req(extra?.required),
  },
  ...extra,
});

const datetime = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'date',
  interface: 'datetime',
  title,
  uiSchema: {
    type: 'string',
    title,
    'x-component': 'DatePicker',
    'x-component-props': { showTime: true, dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm:ss' },
    ...req(extra?.required),
  },
  ...extra,
});

const select = (
  name: string,
  title: string,
  options: { value: string; label: string; color?: string }[],
  extra?: FieldExtra,
): FieldDef => ({
  name,
  type: 'string',
  interface: 'select',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Select', enum: options, ...req(extra?.required) },
  ...extra,
});

const email = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'string',
  interface: 'email',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Input', ...req(extra?.required) },
  ...extra,
});

const phone = (name: string, title: string, extra?: FieldExtra): FieldDef => ({
  name,
  type: 'string',
  interface: 'phone',
  title,
  uiSchema: { type: 'string', title, 'x-component': 'Input', ...req(extra?.required) },
  ...extra,
});

const belongsTo = (
  src: string,
  name: string,
  target: string,
  fk: string,
  title: string,
  labelField: string,
  extra?: Partial<RelationDef>,
): RelationDef => ({
  sourceCollection: src,
  name,
  type: 'belongsTo',
  interface: 'm2o',
  target,
  foreignKey: fk,
  targetKey: 'id',
  title,
  labelField,
  showInTable: true,
  showInForm: true,
  ...extra,
});

// ─── PROJECT MANAGEMENT ───────────────────────────────────

const projectManagement: TemplateDef = {
  key: 'project-management',
  title: '项目管理',
  description: '完整的项目管理系统，涵盖项目规划、任务管理、里程碑、风险、预算和团队协作',
  icon: '📋',
  color: '#1890ff',
  highlights: [
    '项目规划',
    '任务管理',
    '里程碑',
    '风险管理',
    '预算管理',
    '看板视图',
    '日历视图',
    '甘特图',
    '工作流',
    '批量编辑',
    '打印',
    '数据导入导出',
  ],
  collections: [
    {
      name: 'projects',
      title: '项目',
      fields: [
        input('name', '项目名称', { required: true }),
        richText('description', '项目描述'),
        select('status', '项目状态', [
          { value: 'planning', label: '规划中', color: 'default' },
          { value: 'in_progress', label: '进行中', color: 'processing' },
          { value: 'on_hold', label: '暂停', color: 'warning' },
          { value: 'completed', label: '已完成', color: 'success' },
          { value: 'cancelled', label: '已取消', color: 'error' },
        ]),
        select('priority', '优先级', [
          { value: 'low', label: '低', color: 'default' },
          { value: 'medium', label: '中', color: 'processing' },
          { value: 'high', label: '高', color: 'warning' },
          { value: 'urgent', label: '紧急', color: 'error' },
        ]),
        date('startDate', '开始日期'),
        date('endDate', '结束日期'),
        percent('progress', '进度'),
        money('budget', '预算'),
        input('manager', '项目经理'),
        input('client', '客户方', { showInTable: false }),
        textarea('goals', '项目目标', { showInTable: false }),
      ],
    },
    {
      name: 'tasks',
      title: '任务',
      fields: [
        input('title', '任务标题', { required: true }),
        textarea('description', '任务描述'),
        select('status', '状态', [
          { value: 'todo', label: '待办', color: 'default' },
          { value: 'in_progress', label: '进行中', color: 'processing' },
          { value: 'in_review', label: '审核中', color: 'warning' },
          { value: 'done', label: '已完成', color: 'success' },
          { value: 'cancelled', label: '已取消', color: 'error' },
        ]),
        select('priority', '优先级', [
          { value: 'low', label: '低', color: 'default' },
          { value: 'medium', label: '中', color: 'processing' },
          { value: 'high', label: '高', color: 'warning' },
          { value: 'urgent', label: '紧急', color: 'error' },
        ]),
        date('startDate', '开始日期'),
        date('dueDate', '截止日期'),
        datetime('completedAt', '完成时间', { showInTable: false, showInForm: false }),
        input('assignee', '负责人'),
        number('estimatedHours', '预估工时(h)', { step: 0.5, min: 0 }),
        number('actualHours', '实际工时(h)', { step: 0.5, min: 0 }),
        percent('progress', '进度'),
      ],
    },
    {
      name: 'milestones',
      title: '里程碑',
      fields: [
        input('title', '里程碑名称', { required: true }),
        textarea('description', '描述'),
        date('dueDate', '截止日期'),
        datetime('completedAt', '完成时间', { showInTable: false, showInForm: false }),
        select('status', '状态', [
          { value: 'pending', label: '待开始', color: 'default' },
          { value: 'in_progress', label: '进行中', color: 'processing' },
          { value: 'completed', label: '已完成', color: 'success' },
          { value: 'overdue', label: '已逾期', color: 'error' },
        ]),
        input('owner', '负责人'),
      ],
    },
    {
      name: 'work_logs',
      title: '工时记录',
      fields: [
        date('workDate', '工作日期', { required: true }),
        number('hours', '工时(h)', { step: 0.5, min: 0.5 }),
        select('type', '类型', [
          { value: 'development', label: '开发' },
          { value: 'design', label: '设计' },
          { value: 'testing', label: '测试' },
          { value: 'meeting', label: '会议' },
          { value: 'management', label: '管理' },
          { value: 'other', label: '其他' },
        ]),
        textarea('content', '工作内容'),
        input('worker', '工作人员'),
      ],
    },
    {
      name: 'risks',
      title: '风险',
      fields: [
        input('title', '风险名称', { required: true }),
        textarea('description', '风险描述'),
        select('level', '风险等级', [
          { value: 'low', label: '低', color: 'success' },
          { value: 'medium', label: '中', color: 'warning' },
          { value: 'high', label: '高', color: 'error' },
          { value: 'critical', label: '严重', color: 'error' },
        ]),
        select('status', '状态', [
          { value: 'identified', label: '已识别', color: 'default' },
          { value: 'mitigating', label: '应对中', color: 'processing' },
          { value: 'resolved', label: '已解决', color: 'success' },
          { value: 'closed', label: '已关闭', color: 'default' },
        ]),
        date('identifiedDate', '识别日期'),
        textarea('mitigation', '应对策略', { showInTable: false }),
        input('owner', '负责人'),
      ],
    },
    {
      name: 'project_docs',
      title: '项目文档',
      fields: [
        input('title', '文档名称', { required: true }),
        select('type', '文档类型', [
          { value: 'requirement', label: '需求文档' },
          { value: 'design', label: '设计文档' },
          { value: 'technical', label: '技术文档' },
          { value: 'test', label: '测试文档' },
          { value: 'meeting', label: '会议纪要' },
          { value: 'report', label: '项目报告' },
        ]),
        richText('description', '文档描述'),
        url('fileUrl', '文档链接', { showInTable: false }),
        input('version', '版本号'),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'reviewing', label: '评审中', color: 'processing' },
          { value: 'approved', label: '已审批', color: 'success' },
          { value: 'archived', label: '已归档', color: 'default' },
        ]),
        input('author', '作者'),
        date('createdDate', '创建日期', { showInTable: false }),
      ],
    },
    {
      name: 'project_members',
      title: '项目成员',
      fields: [
        input('name', '成员姓名', { required: true }),
        select('role', '项目角色', [
          { value: 'pm', label: '项目经理' },
          { value: 'dev', label: '开发' },
          { value: 'test', label: '测试' },
          { value: 'design', label: '设计' },
          { value: 'ops', label: '运维' },
          { value: 'ba', label: '业务分析' },
        ]),
        select('status', '状态', [
          { value: 'active', label: '在岗', color: 'success' },
          { value: 'left', label: '已离开', color: 'default' },
        ]),
        date('joinDate', '加入日期'),
        date('leaveDate', '离开日期', { showInTable: false }),
        phone('phone', '联系电话', { showInTable: false }),
        email('email', '邮箱', { showInTable: false }),
      ],
    },
    {
      name: 'change_requests',
      title: '变更请求',
      fields: [
        input('title', '变更标题', { required: true }),
        textarea('description', '变更描述'),
        select('type', '变更类型', [
          { value: 'scope', label: '范围变更' },
          { value: 'schedule', label: '进度变更' },
          { value: 'budget', label: '预算变更' },
          { value: 'requirement', label: '需求变更' },
        ]),
        select('status', '状态', [
          { value: 'pending', label: '待审批', color: 'warning' },
          { value: 'approved', label: '已批准', color: 'success' },
          { value: 'rejected', label: '已驳回', color: 'error' },
          { value: 'implemented', label: '已实施', color: 'default' },
        ]),
        textarea('impact', '影响分析', { showInTable: false }),
        date('applyDate', '申请日期'),
        input('applicant', '申请人'),
      ],
    },
    {
      name: 'meeting_records',
      title: '会议记录',
      fields: [
        input('title', '会议主题', { required: true }),
        datetime('startTime', '开始时间'),
        datetime('endTime', '结束时间'),
        input('location', '地点'),
        input('host', '主持人'),
        textarea('attendees', '参会人员'),
        richText('content', '会议内容'),
        textarea('decisions', '会议决议', { showInTable: false }),
      ],
    },
    {
      name: 'budgets',
      title: '项目预算',
      fields: [
        input('category', '预算类别', { required: true }),
        money('planned', '计划金额'),
        money('actual', '实际金额'),
        money('remaining', '剩余金额', { showInForm: false }),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'approved', label: '已审批', color: 'success' },
          { value: 'overrun', label: '超支', color: 'error' },
        ]),
        date('periodStart', '开始日期'),
        date('periodEnd', '结束日期'),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'issue_tracker',
      title: '问题跟踪',
      fields: [
        input('title', '问题标题', { required: true }),
        textarea('description', '问题描述'),
        select('type', '类型', [
          { value: 'bug', label: 'Bug', color: 'error' },
          { value: 'feature', label: '功能需求', color: 'processing' },
          { value: 'improvement', label: '改进', color: 'warning' },
          { value: 'task', label: '任务', color: 'default' },
        ]),
        select('status', '状态', [
          { value: 'open', label: '打开', color: 'processing' },
          { value: 'in_progress', label: '处理中', color: 'warning' },
          { value: 'resolved', label: '已解决', color: 'success' },
          { value: 'closed', label: '已关闭', color: 'default' },
          { value: 'reopened', label: '重新打开', color: 'error' },
        ]),
        select('severity', '严重程度', [
          { value: 'minor', label: '轻微', color: 'default' },
          { value: 'major', label: '重要', color: 'warning' },
          { value: 'critical', label: '严重', color: 'error' },
          { value: 'blocker', label: '阻塞', color: 'error' },
        ]),
        input('assignee', '指派给'),
        input('reporter', '报告人'),
        date('reportDate', '报告日期'),
        textarea('solution', '解决方案', { showInTable: false }),
      ],
    },
  ],
  relations: [
    belongsTo('tasks', 'project', 'projects', 'projectId', '所属项目', 'name'),
    belongsTo('milestones', 'project', 'projects', 'milestoneProjectId', '所属项目', 'name'),
    belongsTo('work_logs', 'task', 'tasks', 'taskId', '关联任务', 'title'),
    belongsTo('risks', 'project', 'projects', 'riskProjectId', '所属项目', 'name'),
    belongsTo('project_docs', 'project', 'projects', 'docProjectId', '所属项目', 'name'),
    belongsTo('project_members', 'project', 'projects', 'memberProjectId', '所属项目', 'name'),
    belongsTo('change_requests', 'project', 'projects', 'changeProjectId', '所属项目', 'name'),
    belongsTo('meeting_records', 'project', 'projects', 'meetingProjectId', '所属项目', 'name'),
    belongsTo('budgets', 'project', 'projects', 'budgetProjectId', '所属项目', 'name'),
    belongsTo('issue_tracker', 'project', 'projects', 'issueProjectId', '所属项目', 'name'),
  ],
  menu: [
    {
      type: 'group',
      title: '项目管理',
      icon: 'ProjectOutlined',
      children: [
        {
          type: 'page',
          title: '项目列表',
          icon: 'AppstoreOutlined',
          collectionName: 'projects',
          gantt: { titleField: 'name', startField: 'startDate', endField: 'endDate', progressField: 'progress' },
        },
        {
          type: 'page',
          title: '里程碑',
          icon: 'FlagOutlined',
          collectionName: 'milestones',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'dueDate' },
        },
        {
          type: 'page',
          title: '风险管理',
          icon: 'WarningOutlined',
          collectionName: 'risks',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'identifiedDate' },
        },
        {
          type: 'page',
          title: '项目文档',
          icon: 'FileTextOutlined',
          collectionName: 'project_docs',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '任务管理',
      icon: 'CarryOutOutlined',
      children: [
        {
          type: 'page',
          title: '任务列表',
          icon: 'UnorderedListOutlined',
          collectionName: 'tasks',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'dueDate' },
          gantt: { titleField: 'title', startField: 'startDate', endField: 'dueDate' },
        },
        {
          type: 'page',
          title: '工时记录',
          icon: 'ClockCircleOutlined',
          collectionName: 'work_logs',
          calendar: { titleField: 'worker', startDateField: 'workDate' },
        },
      ],
    },
    {
      type: 'group',
      title: '协作管理',
      icon: 'TeamOutlined',
      children: [
        { type: 'page', title: '项目成员', icon: 'UserSwitchOutlined', collectionName: 'project_members' },
        {
          type: 'page',
          title: '变更管理',
          icon: 'SwapOutlined',
          collectionName: 'change_requests',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'applyDate' },
        },
        {
          type: 'page',
          title: '会议记录',
          icon: 'AudioOutlined',
          collectionName: 'meeting_records',
          calendar: { titleField: 'title', startDateField: 'startTime', endDateField: 'endTime' },
        },
      ],
    },
    {
      type: 'group',
      title: '质量与预算',
      icon: 'AuditOutlined',
      children: [
        {
          type: 'page',
          title: '项目预算',
          icon: 'AccountBookOutlined',
          collectionName: 'budgets',
          kanban: { groupField: 'status' },
          gantt: { titleField: 'category', startField: 'periodStart', endField: 'periodEnd' },
        },
        {
          type: 'page',
          title: '问题跟踪',
          icon: 'BugOutlined',
          collectionName: 'issue_tracker',
          kanban: { groupField: 'status' },
        },
      ],
    },
  ],
  workflows: [
    {
      title: '任务完成自动更新完成时间',
      type: 'collection',
      description: '当任务状态变为"已完成"时自动记录完成时间',
      triggerConfig: { collection: 'tasks', mode: 2, changed: ['status'] },
      nodes: [
        {
          type: 'condition',
          title: '检查是否已完成',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.status}}', right: 'done' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '更新完成时间',
          config: {
            collection: 'tasks',
            params: { filter: { id: '{{$context.data.id}}' }, values: { completedAt: '{{$system.now}}' } },
          },
        },
      ],
    },
    {
      title: '高风险自动标记紧急',
      type: 'collection',
      description: '当新增严重风险时自动设为紧急等级',
      triggerConfig: { collection: 'risks', mode: 1 },
      nodes: [
        {
          type: 'condition',
          title: '检查风险等级',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.level}}', right: 'critical' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '标记为紧急处理',
          config: {
            collection: 'risks',
            params: { filter: { id: '{{$context.data.id}}' }, values: { status: 'mitigating' } },
          },
        },
      ],
    },
  ],
};

// ─── CRM ──────────────────────────────────────────────────

const crm: TemplateDef = {
  key: 'crm',
  title: '客户管理 CRM',
  description: '完整的客户关系管理系统，涵盖客户管理、商机追踪、合同管理、售后服务等',
  icon: '🤝',
  color: '#52c41a',
  highlights: [
    '客户管理',
    '商机追踪',
    '合同管理',
    '回款管理',
    '售后工单',
    '看板视图',
    '日历视图',
    '甘特图',
    '工作流',
    '批量编辑',
    '打印',
    '数据导入导出',
  ],
  collections: [
    {
      name: 'customers',
      title: '客户',
      fields: [
        input('companyName', '公司名称', { required: true }),
        input('industry', '行业'),
        select('size', '公司规模', [
          { value: 'small', label: '小型(<50人)' },
          { value: 'medium', label: '中型(50-200人)' },
          { value: 'large', label: '大型(200-1000人)' },
          { value: 'enterprise', label: '集团(>1000人)' },
        ]),
        select('status', '客户状态', [
          { value: 'potential', label: '潜在客户', color: 'default' },
          { value: 'following', label: '跟进中', color: 'processing' },
          { value: 'signed', label: '已签约', color: 'success' },
          { value: 'churned', label: '已流失', color: 'error' },
        ]),
        select('source', '客户来源', [
          { value: 'website', label: '官网' },
          { value: 'referral', label: '转介绍' },
          { value: 'exhibition', label: '展会' },
          { value: 'ad', label: '广告' },
          { value: 'cold_call', label: '陌拜' },
          { value: 'other', label: '其他' },
        ]),
        input('address', '地址', { showInTable: false }),
        url('website', '公司官网', { showInTable: false }),
        input('salesRep', '负责销售'),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'contacts',
      title: '联系人',
      fields: [
        input('name', '姓名', { required: true }),
        input('title', '职位'),
        phone('phone', '手机号'),
        email('email', '邮箱'),
        input('department', '部门', { showInTable: false }),
        select('role', '角色', [
          { value: 'decision_maker', label: '决策者', color: 'error' },
          { value: 'influencer', label: '影响者', color: 'warning' },
          { value: 'user', label: '使用者', color: 'processing' },
          { value: 'technical', label: '技术对接人', color: 'default' },
        ]),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'deals',
      title: '商机',
      fields: [
        input('title', '商机名称', { required: true }),
        money('amount', '预计金额', { required: true }),
        select('stage', '商机阶段', [
          { value: 'lead', label: '线索', color: 'default' },
          { value: 'qualification', label: '需求确认', color: 'processing' },
          { value: 'proposal', label: '方案报价', color: 'processing' },
          { value: 'negotiation', label: '商务谈判', color: 'warning' },
          { value: 'contract', label: '合同审批', color: 'warning' },
          { value: 'won', label: '赢单', color: 'success' },
          { value: 'lost', label: '输单', color: 'error' },
        ]),
        date('expectedCloseDate', '预计成交日期'),
        percent('probability', '成交概率'),
        input('salesRep', '负责销售'),
        textarea('nextStep', '下一步行动', { showInTable: false }),
        select(
          'source',
          '商机来源',
          [
            { value: 'new', label: '新客户' },
            { value: 'renewal', label: '续费' },
            { value: 'upsell', label: '增购' },
            { value: 'referral', label: '转介绍' },
          ],
          { showInTable: false },
        ),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'follow_ups',
      title: '跟进记录',
      fields: [
        select('type', '跟进方式', [
          { value: 'phone', label: '电话' },
          { value: 'visit', label: '拜访' },
          { value: 'email', label: '邮件' },
          { value: 'wechat', label: '微信' },
          { value: 'meeting', label: '会议' },
        ]),
        textarea('content', '跟进内容', { required: true }),
        select('result', '跟进结果', [
          { value: 'positive', label: '积极', color: 'success' },
          { value: 'neutral', label: '一般', color: 'warning' },
          { value: 'negative', label: '消极', color: 'error' },
        ]),
        datetime('followedAt', '跟进时间'),
        date('nextFollowUpDate', '下次跟进日期'),
        input('follower', '跟进人'),
      ],
    },
    {
      name: 'contracts',
      title: '合同',
      fields: [
        input('contractNo', '合同编号', { required: true }),
        input('title', '合同名称', { required: true }),
        money('amount', '合同金额', { required: true }),
        date('startDate', '开始日期'),
        date('endDate', '结束日期'),
        select('status', '状态', [
          { value: 'draft', label: '草拟中', color: 'default' },
          { value: 'reviewing', label: '审核中', color: 'processing' },
          { value: 'signed', label: '已签约', color: 'success' },
          { value: 'executing', label: '执行中', color: 'processing' },
          { value: 'completed', label: '已完成', color: 'success' },
          { value: 'terminated', label: '已终止', color: 'error' },
        ]),
        input('signee', '签约人'),
        textarea('terms', '合同条款', { showInTable: false }),
      ],
    },
    {
      name: 'payments',
      title: '回款记录',
      fields: [
        money('amount', '回款金额', { required: true }),
        date('paymentDate', '回款日期'),
        select('method', '付款方式', [
          { value: 'transfer', label: '银行转账' },
          { value: 'check', label: '支票' },
          { value: 'cash', label: '现金' },
          { value: 'online', label: '在线支付' },
        ]),
        select('status', '状态', [
          { value: 'pending', label: '待确认', color: 'warning' },
          { value: 'confirmed', label: '已确认', color: 'success' },
          { value: 'cancelled', label: '已取消', color: 'error' },
        ]),
        input('invoiceNo', '发票号'),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'products',
      title: '产品',
      fields: [
        input('name', '产品名称', { required: true }),
        input('code', '产品编号', { required: true }),
        select('category', '产品类别', [
          { value: 'software', label: '软件' },
          { value: 'hardware', label: '硬件' },
          { value: 'service', label: '服务' },
          { value: 'solution', label: '解决方案' },
        ]),
        money('price', '标准单价'),
        select('status', '状态', [
          { value: 'active', label: '在售', color: 'success' },
          { value: 'discontinued', label: '停售', color: 'error' },
          { value: 'coming_soon', label: '即将上线', color: 'processing' },
        ]),
        richText('description', '产品描述'),
        url('productUrl', '产品链接', { showInTable: false }),
      ],
    },
    {
      name: 'quotes',
      title: '报价单',
      fields: [
        input('quoteNo', '报价编号', { required: true }),
        input('title', '报价标题', { required: true }),
        money('totalAmount', '总金额'),
        date('quoteDate', '报价日期'),
        date('validUntil', '有效期至'),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'sent', label: '已发送', color: 'processing' },
          { value: 'accepted', label: '已接受', color: 'success' },
          { value: 'rejected', label: '已拒绝', color: 'error' },
          { value: 'expired', label: '已过期', color: 'default' },
        ]),
        number('discount', '折扣(%)', { min: 0, max: 100 }),
        textarea('terms', '备注条款', { showInTable: false }),
      ],
    },
    {
      name: 'competitors',
      title: '竞争对手',
      fields: [
        input('name', '公司名称', { required: true }),
        url('website', '官网'),
        select('threatLevel', '威胁等级', [
          { value: 'low', label: '低', color: 'success' },
          { value: 'medium', label: '中', color: 'warning' },
          { value: 'high', label: '高', color: 'error' },
        ]),
        textarea('products', '主要产品', { showInTable: false }),
        textarea('strengths', '竞争优势', { showInTable: false }),
        textarea('weaknesses', '竞争劣势', { showInTable: false }),
        input('analyst', '分析人'),
        date('lastUpdated', '最后更新'),
      ],
    },
    {
      name: 'service_tickets',
      title: '售后工单',
      fields: [
        input('ticketNo', '工单编号', { required: true }),
        input('title', '工单标题', { required: true }),
        select('type', '问题类型', [
          { value: 'bug', label: '故障', color: 'error' },
          { value: 'consultation', label: '咨询', color: 'processing' },
          { value: 'complaint', label: '投诉', color: 'warning' },
          { value: 'suggestion', label: '建议', color: 'default' },
        ]),
        select('status', '状态', [
          { value: 'open', label: '待处理', color: 'warning' },
          { value: 'processing', label: '处理中', color: 'processing' },
          { value: 'resolved', label: '已解决', color: 'success' },
          { value: 'closed', label: '已关闭', color: 'default' },
        ]),
        select('priority', '优先级', [
          { value: 'low', label: '低', color: 'default' },
          { value: 'medium', label: '中', color: 'warning' },
          { value: 'high', label: '高', color: 'error' },
        ]),
        textarea('description', '问题描述'),
        input('handler', '处理人'),
        textarea('solution', '解决方案', { showInTable: false }),
      ],
    },
    {
      name: 'activities',
      title: '日程活动',
      fields: [
        input('title', '活动标题', { required: true }),
        select('type', '类型', [
          { value: 'call', label: '电话' },
          { value: 'meeting', label: '会议' },
          { value: 'visit', label: '拜访' },
          { value: 'email', label: '邮件' },
          { value: 'task', label: '任务' },
        ]),
        datetime('startTime', '开始时间'),
        datetime('endTime', '结束时间'),
        input('location', '地点', { showInTable: false }),
        textarea('description', '描述'),
        input('organizer', '组织者'),
      ],
    },
    {
      name: 'customer_tags',
      title: '客户标签',
      fields: [
        input('name', '标签名称', { required: true }),
        select('category', '分类', [
          { value: 'industry', label: '行业' },
          { value: 'size', label: '规模' },
          { value: 'source', label: '来源' },
          { value: 'custom', label: '自定义' },
        ]),
        input('color', '颜色'),
        textarea('description', '描述'),
      ],
    },
  ],
  relations: [
    belongsTo('contacts', 'customer', 'customers', 'contactCustomerId', '所属客户', 'companyName'),
    belongsTo('deals', 'customer', 'customers', 'dealCustomerId', '所属客户', 'companyName'),
    belongsTo('follow_ups', 'customer', 'customers', 'followCustomerId', '所属客户', 'companyName'),
    belongsTo('contracts', 'customer', 'customers', 'contractCustomerId', '所属客户', 'companyName'),
    belongsTo('contracts', 'deal', 'deals', 'contractDealId', '关联商机', 'title'),
    belongsTo('payments', 'contract', 'contracts', 'paymentContractId', '所属合同', 'contractNo'),
    belongsTo('quotes', 'customer', 'customers', 'quoteCustomerId', '所属客户', 'companyName'),
    belongsTo('quotes', 'deal', 'deals', 'quoteDealId', '关联商机', 'title'),
    belongsTo('service_tickets', 'customer', 'customers', 'ticketCustomerId', '所属客户', 'companyName'),
    belongsTo('activities', 'customer', 'customers', 'activityCustomerId', '所属客户', 'companyName'),
  ],
  menu: [
    {
      type: 'group',
      title: '客户管理',
      icon: 'TeamOutlined',
      children: [
        {
          type: 'page',
          title: '客户列表',
          icon: 'BankOutlined',
          collectionName: 'customers',
          kanban: { groupField: 'status' },
        },
        { type: 'page', title: '联系人', icon: 'ContactsOutlined', collectionName: 'contacts' },
        {
          type: 'page',
          title: '跟进记录',
          icon: 'HistoryOutlined',
          collectionName: 'follow_ups',
          calendar: { titleField: 'content', startDateField: 'nextFollowUpDate' },
        },
      ],
    },
    {
      type: 'group',
      title: '销售管理',
      icon: 'FundOutlined',
      children: [
        {
          type: 'page',
          title: '商机管理',
          icon: 'RiseOutlined',
          collectionName: 'deals',
          kanban: { groupField: 'stage' },
          calendar: { titleField: 'title', startDateField: 'expectedCloseDate' },
        },
        {
          type: 'page',
          title: '合同管理',
          icon: 'AuditOutlined',
          collectionName: 'contracts',
          kanban: { groupField: 'status' },
          gantt: { titleField: 'title', startField: 'startDate', endField: 'endDate' },
        },
        {
          type: 'page',
          title: '回款记录',
          icon: 'AccountBookOutlined',
          collectionName: 'payments',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'invoiceNo', startDateField: 'paymentDate' },
        },
      ],
    },
    {
      type: 'page',
      title: '产品管理',
      icon: 'ShoppingOutlined',
      collectionName: 'products',
      kanban: { groupField: 'status' },
    },
    {
      type: 'group',
      title: '服务支持',
      icon: 'CustomerServiceOutlined',
      children: [
        {
          type: 'page',
          title: '报价管理',
          icon: 'FileDoneOutlined',
          collectionName: 'quotes',
          kanban: { groupField: 'status' },
          gantt: { titleField: 'title', startField: 'quoteDate', endField: 'validUntil' },
        },
        { type: 'page', title: '竞争对手', icon: 'ThunderboltOutlined', collectionName: 'competitors' },
        {
          type: 'page',
          title: '售后工单',
          icon: 'ToolOutlined',
          collectionName: 'service_tickets',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '客户运营',
      icon: 'ScheduleOutlined',
      children: [
        {
          type: 'page',
          title: '日程活动',
          icon: 'CalendarOutlined',
          collectionName: 'activities',
          calendar: { titleField: 'title', startDateField: 'startTime', endDateField: 'endTime' },
        },
        { type: 'page', title: '客户标签', icon: 'TagsOutlined', collectionName: 'customer_tags' },
      ],
    },
  ],
  workflows: [
    {
      title: '商机赢单自动更新概率',
      type: 'collection',
      description: '当商机阶段变为"赢单"时自动设置成交概率为100%',
      triggerConfig: { collection: 'deals', mode: 2, changed: ['stage'] },
      nodes: [
        {
          type: 'condition',
          title: '检查是否赢单',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.stage}}', right: 'won' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '更新成交概率',
          config: {
            collection: 'deals',
            params: { filter: { id: '{{$context.data.id}}' }, values: { probability: 100 } },
          },
        },
      ],
    },
    {
      title: '新客户自动分配跟进',
      type: 'collection',
      description: '新增客户时自动设为跟进中状态',
      triggerConfig: { collection: 'customers', mode: 1 },
      nodes: [
        {
          type: 'condition',
          title: '检查是否潜在客户',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.status}}', right: 'potential' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '自动设为跟进中',
          config: {
            collection: 'customers',
            params: { filter: { id: '{{$context.data.id}}' }, values: { status: 'following' } },
          },
        },
      ],
    },
  ],
};

// ─── HR ───────────────────────────────────────────────────

const hr: TemplateDef = {
  key: 'hr',
  title: '人事管理',
  description: '完整的人力资源管理系统，涵盖组织架构、员工管理、考勤、招聘、培训和绩效管理',
  icon: '👥',
  color: '#722ed1',
  highlights: [
    '组织架构',
    '员工档案',
    '考勤管理',
    '请假管理',
    '招聘管理',
    '培训记录',
    '绩效评估',
    '看板视图',
    '日历视图',
    '甘特图',
    '工作流',
    '批量编辑',
    '打印',
    '数据导入导出',
  ],
  collections: [
    {
      name: 'departments',
      title: '部门',
      fields: [
        input('name', '部门名称', { required: true }),
        input('code', '部门编号'),
        input('manager', '部门负责人'),
        integer('headcount', '编制人数'),
        select('status', '状态', [
          { value: 'active', label: '正常', color: 'success' },
          { value: 'disabled', label: '停用', color: 'default' },
        ]),
        textarea('description', '部门职能'),
      ],
    },
    {
      name: 'positions',
      title: '职位',
      fields: [
        input('title', '职位名称', { required: true }),
        input('code', '职位编号'),
        select('level', '职级', [
          { value: 'junior', label: '初级' },
          { value: 'mid', label: '中级' },
          { value: 'senior', label: '高级' },
          { value: 'lead', label: '主管' },
          { value: 'manager', label: '经理' },
          { value: 'director', label: '总监' },
        ]),
        select('status', '状态', [
          { value: 'active', label: '招聘中', color: 'success' },
          { value: 'filled', label: '已满编', color: 'default' },
          { value: 'closed', label: '已关闭', color: 'error' },
        ]),
        textarea('responsibilities', '岗位职责', { showInTable: false }),
        textarea('requirements', '任职要求', { showInTable: false }),
      ],
    },
    {
      name: 'employees',
      title: '员工',
      fields: [
        input('name', '姓名', { required: true }),
        input('employeeId', '工号', { required: true }),
        select('gender', '性别', [
          { value: 'male', label: '男' },
          { value: 'female', label: '女' },
        ]),
        phone('phone', '手机号'),
        email('email', '邮箱'),
        date('hireDate', '入职日期'),
        date('contractEndDate', '合同到期日', { showInTable: false }),
        select('status', '状态', [
          { value: 'probation', label: '试用期', color: 'warning' },
          { value: 'active', label: '在职', color: 'success' },
          { value: 'resigned', label: '已离职', color: 'default' },
        ]),
        input('idCard', '身份证号', { showInTable: false }),
        input('address', '住址', { showInTable: false }),
        input('emergencyContact', '紧急联系人', { showInTable: false }),
        phone('emergencyPhone', '紧急联系电话', { showInTable: false }),
        select(
          'education',
          '学历',
          [
            { value: 'high_school', label: '高中' },
            { value: 'associate', label: '大专' },
            { value: 'bachelor', label: '本科' },
            { value: 'master', label: '硕士' },
            { value: 'phd', label: '博士' },
          ],
          { showInTable: false },
        ),
      ],
    },
    {
      name: 'attendance',
      title: '考勤记录',
      fields: [
        date('date', '日期'),
        datetime('checkIn', '签到时间'),
        datetime('checkOut', '签退时间'),
        number('workHours', '工时(h)', { step: '0.1' }),
        select('status', '考勤状态', [
          { value: 'normal', label: '正常', color: 'success' },
          { value: 'late', label: '迟到', color: 'warning' },
          { value: 'early_leave', label: '早退', color: 'warning' },
          { value: 'absent', label: '缺勤', color: 'error' },
          { value: 'leave', label: '请假', color: 'processing' },
        ]),
        textarea('remark', '备注'),
      ],
    },
    {
      name: 'leave_requests',
      title: '请假申请',
      fields: [
        select('type', '请假类型', [
          { value: 'annual', label: '年假', color: 'processing' },
          { value: 'sick', label: '病假', color: 'error' },
          { value: 'personal', label: '事假', color: 'default' },
          { value: 'maternity', label: '产假', color: 'warning' },
          { value: 'marriage', label: '婚假', color: 'success' },
          { value: 'bereavement', label: '丧假', color: 'default' },
        ]),
        date('startDate', '开始日期'),
        date('endDate', '结束日期'),
        number('days', '请假天数', { min: 0.5, step: 0.5 }),
        textarea('reason', '请假事由'),
        select('status', '状态', [
          { value: 'pending', label: '待审批', color: 'warning' },
          { value: 'approved', label: '已批准', color: 'success' },
          { value: 'rejected', label: '已驳回', color: 'error' },
          { value: 'cancelled', label: '已撤销', color: 'default' },
        ]),
        input('applicant', '申请人'),
        input('approver', '审批人'),
      ],
    },
    {
      name: 'salary_records',
      title: '薪资记录',
      fields: [
        input('period', '薪资周期'),
        money('baseSalary', '基本工资'),
        money('bonus', '奖金'),
        money('allowance', '津贴'),
        money('deduction', '扣款'),
        money('socialSecurity', '社保扣除', { showInTable: false }),
        money('tax', '个税', { showInTable: false }),
        money('netSalary', '实发工资'),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'confirmed', label: '已确认', color: 'processing' },
          { value: 'paid', label: '已发放', color: 'success' },
        ]),
      ],
    },
    {
      name: 'recruitments',
      title: '招聘需求',
      fields: [
        input('positionTitle', '招聘职位', { required: true }),
        integer('headcount', '招聘人数'),
        select('urgency', '紧急程度', [
          { value: 'low', label: '一般', color: 'default' },
          { value: 'medium', label: '较急', color: 'warning' },
          { value: 'high', label: '紧急', color: 'error' },
        ]),
        select('status', '状态', [
          { value: 'open', label: '招聘中', color: 'processing' },
          { value: 'interviewing', label: '面试中', color: 'warning' },
          { value: 'filled', label: '已满员', color: 'success' },
          { value: 'closed', label: '已关闭', color: 'default' },
        ]),
        date('publishDate', '发布日期'),
        date('deadline', '截止日期'),
        textarea('requirements', '岗位要求', { showInTable: false }),
        input('recruiter', '招聘负责人'),
      ],
    },
    {
      name: 'candidates',
      title: '候选人',
      fields: [
        input('name', '姓名', { required: true }),
        phone('phone', '手机号码'),
        email('email', '邮箱'),
        input('currentCompany', '当前公司', { showInTable: false }),
        select('education', '学历', [
          { value: 'associate', label: '大专' },
          { value: 'bachelor', label: '本科' },
          { value: 'master', label: '硕士' },
          { value: 'phd', label: '博士' },
        ]),
        integer('workYears', '工作年限'),
        select('status', '状态', [
          { value: 'new', label: '新投递', color: 'default' },
          { value: 'screening', label: '筛选中', color: 'processing' },
          { value: 'interviewing', label: '面试中', color: 'warning' },
          { value: 'offered', label: '已发offer', color: 'success' },
          { value: 'hired', label: '已入职', color: 'success' },
          { value: 'rejected', label: '已淘汰', color: 'error' },
        ]),
        select('source', '来源', [
          { value: 'website', label: '招聘网站' },
          { value: 'headhunter', label: '猎头' },
          { value: 'referral', label: '内推' },
          { value: 'campus', label: '校招' },
        ]),
        textarea('evaluation', '面试评价', { showInTable: false }),
        date('applyDate', '投递日期'),
      ],
    },
    {
      name: 'training_records',
      title: '培训记录',
      fields: [
        input('title', '培训主题', { required: true }),
        select('type', '培训类型', [
          { value: 'orientation', label: '入职培训' },
          { value: 'skill', label: '技能培训' },
          { value: 'management', label: '管理培训' },
          { value: 'safety', label: '安全培训' },
          { value: 'compliance', label: '合规培训' },
        ]),
        date('startDate', '开始日期'),
        date('endDate', '结束日期'),
        input('trainer', '培训讲师'),
        input('location', '培训地点', { showInTable: false }),
        integer('participants', '参与人数'),
        select('status', '状态', [
          { value: 'planned', label: '已计划', color: 'default' },
          { value: 'in_progress', label: '进行中', color: 'processing' },
          { value: 'completed', label: '已完成', color: 'success' },
          { value: 'cancelled', label: '已取消', color: 'error' },
        ]),
        textarea('content', '培训内容', { showInTable: false }),
      ],
    },
    {
      name: 'performance_reviews',
      title: '绩效评估',
      fields: [
        input('period', '评估周期', { required: true }),
        select('type', '评估类型', [
          { value: 'monthly', label: '月度' },
          { value: 'quarterly', label: '季度' },
          { value: 'annual', label: '年度' },
          { value: 'probation', label: '试用期' },
        ]),
        number('score', '综合评分', { min: 0, max: 100 }),
        select('grade', '等级', [
          { value: 'A', label: '优秀', color: 'success' },
          { value: 'B', label: '良好', color: 'processing' },
          { value: 'C', label: '合格', color: 'warning' },
          { value: 'D', label: '待改进', color: 'error' },
        ]),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'submitted', label: '已提交', color: 'processing' },
          { value: 'reviewed', label: '已审核', color: 'success' },
        ]),
        textarea('strengths', '工作亮点', { showInTable: false }),
        textarea('improvements', '待改进', { showInTable: false }),
        input('reviewer', '评估人'),
      ],
    },
    {
      name: 'labor_contracts',
      title: '劳动合同',
      fields: [
        input('contractNo', '合同编号', { required: true }),
        select('type', '合同类型', [
          { value: 'fixed', label: '固定期限' },
          { value: 'permanent', label: '无固定期限' },
          { value: 'project', label: '项目合同' },
          { value: 'intern', label: '实习协议' },
        ]),
        date('startDate', '开始日期'),
        date('endDate', '结束日期'),
        money('salary', '月薪'),
        select('status', '状态', [
          { value: 'active', label: '生效中', color: 'success' },
          { value: 'expired', label: '已到期', color: 'warning' },
          { value: 'terminated', label: '已终止', color: 'error' },
          { value: 'renewed', label: '已续签', color: 'processing' },
        ]),
        textarea('terms', '特殊条款', { showInTable: false }),
      ],
    },
    {
      name: 'overtime_records',
      title: '加班记录',
      fields: [
        date('overtimeDate', '加班日期', { required: true }),
        select('type', '加班类型', [
          { value: 'workday', label: '工作日加班', color: 'default' },
          { value: 'weekend', label: '周末加班', color: 'processing' },
          { value: 'holiday', label: '法定节假日加班', color: 'error' },
        ]),
        number('hours', '加班时长(h)', { min: 0.5, step: 0.5 }),
        textarea('reason', '加班事由'),
        select('compensationType', '补偿方式', [
          { value: 'pay', label: '加班费' },
          { value: 'timeoff', label: '调休' },
        ]),
        select('status', '状态', [
          { value: 'pending', label: '待审批', color: 'warning' },
          { value: 'approved', label: '已批准', color: 'success' },
          { value: 'rejected', label: '已驳回', color: 'error' },
        ]),
        input('applicant', '申请人'),
      ],
    },
  ],
  relations: [
    belongsTo('positions', 'department', 'departments', 'positionDeptId', '所属部门', 'name'),
    belongsTo('employees', 'department', 'departments', 'employeeDeptId', '所属部门', 'name'),
    belongsTo('employees', 'position', 'positions', 'employeePositionId', '职位', 'title'),
    belongsTo('attendance', 'employee', 'employees', 'attendanceEmployeeId', '员工', 'name'),
    belongsTo('leave_requests', 'employee', 'employees', 'leaveEmployeeId', '员工', 'name'),
    belongsTo('salary_records', 'employee', 'employees', 'salaryEmployeeId', '员工', 'name'),
    belongsTo('recruitments', 'department', 'departments', 'recruitDeptId', '招聘部门', 'name'),
    belongsTo('recruitments', 'position', 'positions', 'recruitPositionId', '招聘职位', 'title'),
    belongsTo('candidates', 'recruitment', 'recruitments', 'candidateRecruitId', '应聘岗位', 'positionTitle'),
    belongsTo('performance_reviews', 'employee', 'employees', 'reviewEmployeeId', '被评估人', 'name'),
    belongsTo('labor_contracts', 'employee', 'employees', 'contractEmployeeId', '员工', 'name'),
  ],
  menu: [
    {
      type: 'group',
      title: '组织架构',
      icon: 'ApartmentOutlined',
      children: [
        { type: 'page', title: '部门管理', icon: 'ClusterOutlined', collectionName: 'departments' },
        {
          type: 'page',
          title: '职位管理',
          icon: 'SolutionOutlined',
          collectionName: 'positions',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '员工管理',
      icon: 'UserOutlined',
      children: [
        {
          type: 'page',
          title: '员工档案',
          icon: 'IdcardOutlined',
          collectionName: 'employees',
          kanban: { groupField: 'status' },
        },
        {
          type: 'page',
          title: '考勤管理',
          icon: 'FieldTimeOutlined',
          collectionName: 'attendance',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'status', startDateField: 'date' },
        },
        {
          type: 'page',
          title: '请假管理',
          icon: 'CalendarOutlined',
          collectionName: 'leave_requests',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'type', startDateField: 'startDate', endDateField: 'endDate' },
          gantt: { titleField: 'type', startField: 'startDate', endField: 'endDate' },
        },
        {
          type: 'page',
          title: '薪资管理',
          icon: 'PayCircleOutlined',
          collectionName: 'salary_records',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '招聘管理',
      icon: 'UsergroupAddOutlined',
      children: [
        {
          type: 'page',
          title: '招聘需求',
          icon: 'FileSearchOutlined',
          collectionName: 'recruitments',
          kanban: { groupField: 'status' },
          gantt: { titleField: 'positionTitle', startField: 'publishDate', endField: 'deadline' },
        },
        {
          type: 'page',
          title: '候选人管理',
          icon: 'UserAddOutlined',
          collectionName: 'candidates',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'name', startDateField: 'applyDate' },
        },
      ],
    },
    {
      type: 'group',
      title: '发展与绩效',
      icon: 'RiseOutlined',
      children: [
        {
          type: 'page',
          title: '培训记录',
          icon: 'ReadOutlined',
          collectionName: 'training_records',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'startDate', endDateField: 'endDate' },
          gantt: { titleField: 'title', startField: 'startDate', endField: 'endDate' },
        },
        {
          type: 'page',
          title: '绩效评估',
          icon: 'TrophyOutlined',
          collectionName: 'performance_reviews',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '合同与考勤',
      icon: 'FileProtectOutlined',
      children: [
        {
          type: 'page',
          title: '劳动合同',
          icon: 'FileDoneOutlined',
          collectionName: 'labor_contracts',
          kanban: { groupField: 'status' },
          gantt: { titleField: 'contractNo', startField: 'startDate', endField: 'endDate' },
        },
        {
          type: 'page',
          title: '加班记录',
          icon: 'FieldTimeOutlined',
          collectionName: 'overtime_records',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'reason', startDateField: 'overtimeDate' },
        },
      ],
    },
  ],
  workflows: [
    {
      title: '请假审批自动处理',
      type: 'collection',
      description: '1天以内请假自动批准',
      triggerConfig: { collection: 'leave_requests', mode: 1 },
      nodes: [
        {
          type: 'condition',
          title: '检查请假天数',
          config: {
            rejectOnFalse: false,
            engine: 'basic',
            calculation: {
              group: { type: 'and', calculations: [{ calculator: 'lte', left: '{{$context.data.days}}', right: 1 }] },
            },
          },
        },
        {
          type: 'update',
          title: '1天内自动批准',
          config: {
            collection: 'leave_requests',
            params: { filter: { id: '{{$context.data.id}}' }, values: { status: 'approved' } },
          },
        },
      ],
    },
    {
      title: '试用期到期提醒',
      type: 'collection',
      description: '员工入职时检查是否需要设置试用期提醒',
      triggerConfig: { collection: 'employees', mode: 1 },
      nodes: [
        {
          type: 'condition',
          title: '检查是否试用期',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.status}}', right: 'probation' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '标记需跟进',
          config: {
            collection: 'employees',
            params: { filter: { id: '{{$context.data.id}}' }, values: { status: 'probation' } },
          },
        },
      ],
    },
  ],
};

// ─── CMS ──────────────────────────────────────────────────

const cms: TemplateDef = {
  key: 'cms',
  title: '内容管理',
  description: '完整的内容管理系统，涵盖文章发布、分类标签、评论审核、SEO优化等',
  icon: '📰',
  color: '#fa8c16',
  highlights: [
    '文章管理',
    '分类体系',
    '标签管理',
    '评论审核',
    '页面管理',
    '看板视图',
    '日历视图',
    '工作流',
    '富文本',
    'URL链接',
    '批量编辑',
    '打印',
    '数据导入导出',
  ],
  collections: [
    {
      name: 'categories',
      title: '分类',
      fields: [
        input('name', '分类名称', { required: true }),
        input('slug', '标识(Slug)'),
        textarea('description', '描述', { showInTable: false }),
        integer('sort', '排序'),
        select('status', '状态', [
          { value: 'active', label: '启用', color: 'success' },
          { value: 'disabled', label: '停用', color: 'default' },
        ]),
      ],
    },
    {
      name: 'tags',
      title: '标签',
      fields: [
        input('name', '标签名称', { required: true }),
        input('slug', '标识(Slug)'),
        input('color', '颜色'),
        integer('articleCount', '文章数', {}, { showInForm: false }),
      ],
    },
    {
      name: 'authors',
      title: '作者',
      fields: [
        input('name', '作者名称', { required: true }),
        email('email', '邮箱'),
        url('avatar', '头像URL', { showInTable: false }),
        textarea('bio', '简介'),
        select('status', '状态', [
          { value: 'active', label: '活跃', color: 'success' },
          { value: 'inactive', label: '停用', color: 'default' },
        ]),
        integer('articleCount', '文章数', {}, { showInForm: false }),
      ],
    },
    {
      name: 'articles',
      title: '文章',
      fields: [
        input('title', '标题', { required: true }),
        input('slug', '标识(Slug)', { showInTable: false }),
        url('coverImage', '封面图URL', { showInTable: false }),
        textarea('summary', '摘要', { showInTable: false }),
        richText('content', '正文'),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'review', label: '审核中', color: 'processing' },
          { value: 'published', label: '已发布', color: 'success' },
          { value: 'rejected', label: '已退回', color: 'error' },
          { value: 'archived', label: '已归档', color: 'default' },
        ]),
        date('publishDate', '发布日期'),
        select('isTop', '置顶', [
          { value: 'yes', label: '是', color: 'warning' },
          { value: 'no', label: '否', color: 'default' },
        ]),
        integer('wordCount', '字数', {}, { showInForm: false }),
        integer('views', '阅读量', {}, { showInForm: false }),
        integer('likes', '点赞数', {}, { showInForm: false }),
        input('source', '来源'),
        url('sourceUrl', '来源链接', { showInTable: false }),
        input('seoTitle', 'SEO标题', { showInTable: false }),
        textarea('seoDescription', 'SEO描述', { showInTable: false }),
      ],
    },
    {
      name: 'comments',
      title: '评论',
      fields: [
        input('author', '评论者'),
        email('email', '邮箱'),
        textarea('content', '评论内容', { required: true }),
        select('status', '状态', [
          { value: 'pending', label: '待审核', color: 'warning' },
          { value: 'approved', label: '已通过', color: 'success' },
          { value: 'spam', label: '垃圾', color: 'error' },
          { value: 'trash', label: '删除', color: 'default' },
        ]),
        integer('likes', '点赞数', {}, { showInForm: false }),
        input('ip', 'IP地址', { showInTable: false, showInForm: false }),
      ],
    },
    {
      name: 'pages',
      title: '页面',
      fields: [
        input('title', '页面标题', { required: true }),
        input('slug', '标识(Slug)'),
        richText('content', '页面内容'),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'published', label: '已发布', color: 'success' },
        ]),
        integer('sort', '排序'),
        input('seoTitle', 'SEO标题', { showInTable: false }),
        textarea('seoDescription', 'SEO描述', { showInTable: false }),
      ],
    },
    {
      name: 'media_files',
      title: '媒体文件',
      fields: [
        input('title', '文件名', { required: true }),
        url('fileUrl', '文件地址'),
        select('type', '类型', [
          { value: 'image', label: '图片' },
          { value: 'video', label: '视频' },
          { value: 'audio', label: '音频' },
          { value: 'document', label: '文档' },
        ]),
        input('mimeType', 'MIME类型', { showInTable: false }),
        integer('fileSize', '文件大小(KB)'),
        textarea('description', '描述', { showInTable: false }),
      ],
    },
    {
      name: 'link_resources',
      title: '友情链接',
      fields: [
        input('name', '站点名称', { required: true }),
        url('url', '链接地址', { required: true }),
        textarea('description', '描述'),
        url('logo', 'Logo地址', { showInTable: false }),
        select('status', '状态', [
          { value: 'active', label: '启用', color: 'success' },
          { value: 'pending', label: '待审核', color: 'warning' },
          { value: 'disabled', label: '停用', color: 'default' },
        ]),
        integer('sort', '排序'),
      ],
    },
    {
      name: 'subscribers',
      title: '订阅者',
      fields: [
        email('email', '邮箱', { required: true }),
        input('name', '姓名'),
        select('status', '状态', [
          { value: 'active', label: '已订阅', color: 'success' },
          { value: 'unsubscribed', label: '已退订', color: 'default' },
        ]),
        datetime('subscribedAt', '订阅时间', { showInForm: false }),
        datetime('unsubscribedAt', '退订时间', { showInTable: false, showInForm: false }),
      ],
    },
    {
      name: 'newsletters',
      title: '邮件推送',
      fields: [
        input('subject', '邮件主题', { required: true }),
        textarea('content', '邮件内容', { showInTable: false }),
        select('status', '状态', [
          { value: 'draft', label: '草稿', color: 'default' },
          { value: 'scheduled', label: '已排期', color: 'processing' },
          { value: 'sent', label: '已发送', color: 'success' },
          { value: 'failed', label: '发送失败', color: 'error' },
        ]),
        datetime('scheduledAt', '计划发送时间'),
        datetime('sentAt', '实际发送时间', { showInTable: false }),
        integer('recipientCount', '收件人数', {}, { showInForm: false }),
        integer('openCount', '打开数', {}, { showInForm: false }),
        input('sender', '发送人'),
      ],
    },
    {
      name: 'site_settings',
      title: '站点配置',
      fields: [
        input('key', '配置项', { required: true }),
        textarea('value', '配置值'),
        input('group', '分组'),
        textarea('description', '说明', { showInTable: false }),
      ],
    },
  ],
  relations: [
    belongsTo('articles', 'category', 'categories', 'articleCategoryId', '所属分类', 'name'),
    belongsTo('articles', 'author', 'authors', 'articleAuthorId', '作者', 'name'),
    belongsTo('comments', 'article', 'articles', 'commentArticleId', '所属文章', 'title'),
    belongsTo('pages', 'author', 'authors', 'pageAuthorId', '作者', 'name'),
  ],
  menu: [
    {
      type: 'group',
      title: '内容管理',
      icon: 'EditOutlined',
      children: [
        {
          type: 'page',
          title: '文章管理',
          icon: 'ReadOutlined',
          collectionName: 'articles',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'title', startDateField: 'publishDate' },
        },
        {
          type: 'page',
          title: '页面管理',
          icon: 'FileOutlined',
          collectionName: 'pages',
          kanban: { groupField: 'status' },
        },
        {
          type: 'page',
          title: '评论管理',
          icon: 'CommentOutlined',
          collectionName: 'comments',
          kanban: { groupField: 'status' },
        },
      ],
    },
    {
      type: 'group',
      title: '内容配置',
      icon: 'SettingOutlined',
      children: [
        { type: 'page', title: '分类管理', icon: 'TagsOutlined', collectionName: 'categories' },
        { type: 'page', title: '标签管理', icon: 'TagOutlined', collectionName: 'tags' },
        { type: 'page', title: '作者管理', icon: 'UserOutlined', collectionName: 'authors' },
      ],
    },
    {
      type: 'group',
      title: '运营管理',
      icon: 'DashboardOutlined',
      children: [
        { type: 'page', title: '媒体库', icon: 'PictureOutlined', collectionName: 'media_files' },
        { type: 'page', title: '友情链接', icon: 'LinkOutlined', collectionName: 'link_resources' },
        {
          type: 'page',
          title: '订阅管理',
          icon: 'MailOutlined',
          collectionName: 'subscribers',
          kanban: { groupField: 'status' },
        },
        {
          type: 'page',
          title: '邮件推送',
          icon: 'SendOutlined',
          collectionName: 'newsletters',
          kanban: { groupField: 'status' },
          calendar: { titleField: 'subject', startDateField: 'scheduledAt' },
        },
        { type: 'page', title: '站点配置', icon: 'SettingOutlined', collectionName: 'site_settings' },
      ],
    },
  ],
  workflows: [
    {
      title: '文章发布自动更新统计',
      type: 'collection',
      description: '文章状态变为已发布时自动更新发布日期',
      triggerConfig: { collection: 'articles', mode: 2, changed: ['status'] },
      nodes: [
        {
          type: 'condition',
          title: '检查是否发布',
          config: {
            rejectOnFalse: true,
            engine: 'basic',
            calculation: {
              group: {
                type: 'and',
                calculations: [{ calculator: 'equal', left: '{{$context.data.status}}', right: 'published' }],
              },
            },
          },
        },
        {
          type: 'update',
          title: '更新发布日期',
          config: {
            collection: 'articles',
            params: { filter: { id: '{{$context.data.id}}' }, values: { publishDate: '{{$system.now}}' } },
          },
        },
      ],
    },
    {
      title: '新评论自动待审核',
      type: 'collection',
      description: '新评论默认为待审核状态',
      triggerConfig: { collection: 'comments', mode: 1 },
      nodes: [
        {
          type: 'update',
          title: '设置为待审核',
          config: {
            collection: 'comments',
            params: { filter: { id: '{{$context.data.id}}' }, values: { status: 'pending' } },
          },
        },
      ],
    },
  ],
};

export const builtInTemplates: TemplateDef[] = [projectManagement, crm, hr, cms];

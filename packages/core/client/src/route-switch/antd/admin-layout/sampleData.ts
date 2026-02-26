/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export interface SampleRecord {
  [key: string]: any;
}

export interface SampleBatch {
  collection: string;
  records: SampleRecord[];
}

export function isRef(v: any): v is { __ref: string; __field: string; __match: Record<string, any> } {
  return v && typeof v === 'object' && '__ref' in v;
}

// ─── PROJECT MANAGEMENT ───────────────────────────────────

const pmProjects: SampleBatch = {
  collection: 'projects',
  records: [
    {
      name: '智能物流平台',
      status: 'in_progress',
      priority: 'high',
      startDate: '2025-01-15',
      endDate: '2025-08-30',
      progress: 45,
      budget: 2000000,
      manager: '张明',
      client: '顺通物流集团',
    },
    {
      name: '电商数据中台',
      status: 'in_progress',
      priority: 'urgent',
      startDate: '2025-02-01',
      endDate: '2025-07-15',
      progress: 65,
      budget: 1500000,
      manager: '李婷',
      client: '鑫达电商',
    },
    {
      name: '企业OA系统',
      status: 'planning',
      priority: 'medium',
      startDate: '2025-04-01',
      endDate: '2025-10-31',
      progress: 10,
      budget: 800000,
      manager: '王刚',
      client: '华信科技',
    },
    {
      name: '移动端APP改版',
      status: 'completed',
      priority: 'medium',
      startDate: '2024-09-01',
      endDate: '2025-01-31',
      progress: 100,
      budget: 600000,
      manager: '赵丽',
      client: '乐享生活',
    },
  ],
};

const pmTasks: SampleBatch = {
  collection: 'tasks',
  records: [
    {
      title: '需求调研与分析',
      status: 'done',
      priority: 'high',
      startDate: '2025-01-15',
      dueDate: '2025-02-15',
      assignee: '陈伟',
      estimatedHours: 80,
      actualHours: 72,
      progress: 100,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '系统架构设计',
      status: 'done',
      priority: 'high',
      startDate: '2025-02-01',
      dueDate: '2025-03-01',
      assignee: '刘洋',
      estimatedHours: 60,
      actualHours: 55,
      progress: 100,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '仓储模块开发',
      status: 'in_progress',
      priority: 'urgent',
      startDate: '2025-03-01',
      dueDate: '2025-05-15',
      assignee: '张伟',
      estimatedHours: 160,
      actualHours: 90,
      progress: 60,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '数据仓库搭建',
      status: 'in_progress',
      priority: 'high',
      startDate: '2025-02-10',
      dueDate: '2025-04-30',
      assignee: '王磊',
      estimatedHours: 120,
      actualHours: 80,
      progress: 70,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '电商数据中台' } },
    },
    {
      title: 'ETL管道开发',
      status: 'todo',
      priority: 'medium',
      startDate: '2025-04-01',
      dueDate: '2025-06-30',
      assignee: '李华',
      estimatedHours: 100,
      progress: 0,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '电商数据中台' } },
    },
    {
      title: 'OA需求整理',
      status: 'in_progress',
      priority: 'medium',
      startDate: '2025-03-15',
      dueDate: '2025-04-15',
      assignee: '赵敏',
      estimatedHours: 40,
      actualHours: 15,
      progress: 30,
      projectId: { __ref: 'projects', __field: 'id', __match: { name: '企业OA系统' } },
    },
  ],
};

const pmMilestones: SampleBatch = {
  collection: 'milestones',
  records: [
    {
      title: '需求评审通过',
      status: 'completed',
      dueDate: '2025-02-20',
      owner: '张明',
      milestoneProjectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '系统上线',
      status: 'pending',
      dueDate: '2025-08-30',
      owner: '张明',
      milestoneProjectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '数据仓库交付',
      status: 'in_progress',
      dueDate: '2025-05-15',
      owner: '李婷',
      milestoneProjectId: { __ref: 'projects', __field: 'id', __match: { name: '电商数据中台' } },
    },
  ],
};

const pmRisks: SampleBatch = {
  collection: 'risks',
  records: [
    {
      title: '核心开发人员离职风险',
      level: 'high',
      status: 'identified',
      identifiedDate: '2025-03-01',
      owner: '张明',
      riskProjectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '第三方API变更',
      level: 'medium',
      status: 'mitigating',
      identifiedDate: '2025-02-15',
      owner: '刘洋',
      riskProjectId: { __ref: 'projects', __field: 'id', __match: { name: '电商数据中台' } },
    },
  ],
};

const pmIssues: SampleBatch = {
  collection: 'issue_tracker',
  records: [
    {
      title: '仓储模块性能优化',
      type: 'improvement',
      status: 'open',
      severity: 'major',
      assignee: '张伟',
      reporter: '陈伟',
      reportDate: '2025-03-10',
      issueProjectId: { __ref: 'projects', __field: 'id', __match: { name: '智能物流平台' } },
    },
    {
      title: '数据同步延迟问题',
      type: 'bug',
      status: 'in_progress',
      severity: 'critical',
      assignee: '王磊',
      reporter: '李婷',
      reportDate: '2025-03-05',
      issueProjectId: { __ref: 'projects', __field: 'id', __match: { name: '电商数据中台' } },
    },
  ],
};

// ─── CRM ──────────────────────────────────────────────────

const crmCustomers: SampleBatch = {
  collection: 'customers',
  records: [
    {
      companyName: '深圳腾飞科技',
      industry: '软件/互联网',
      size: 'large',
      status: 'signed',
      source: 'website',
      salesRep: '王明',
    },
    {
      companyName: '北京启航教育',
      industry: '教育/培训',
      size: 'medium',
      status: 'following',
      source: 'referral',
      salesRep: '李芳',
    },
    {
      companyName: '上海盛达贸易',
      industry: '贸易/进出口',
      size: 'enterprise',
      status: 'signed',
      source: 'exhibition',
      salesRep: '张伟',
    },
    {
      companyName: '杭州智云数据',
      industry: '大数据/AI',
      size: 'small',
      status: 'potential',
      source: 'ad',
      salesRep: '赵丽',
    },
    {
      companyName: '广州美佳电子',
      industry: '电子/硬件',
      size: 'medium',
      status: 'following',
      source: 'cold_call',
      salesRep: '王明',
    },
  ],
};

const crmContacts: SampleBatch = {
  collection: 'contacts',
  records: [
    {
      name: '陈总',
      title: 'CEO',
      phone: '13800001111',
      email: 'chen@tengfei.com',
      role: 'decision_maker',
      contactCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '深圳腾飞科技' } },
    },
    {
      name: '刘经理',
      title: '采购经理',
      phone: '13900002222',
      email: 'liu@qihang.com',
      role: 'influencer',
      contactCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '北京启航教育' } },
    },
    {
      name: '黄工',
      title: '技术总监',
      phone: '13700003333',
      email: 'huang@shengda.com',
      role: 'technical',
      contactCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '上海盛达贸易' } },
    },
  ],
};

const crmDeals: SampleBatch = {
  collection: 'deals',
  records: [
    {
      title: '腾飞-ERP系统升级',
      amount: 500000,
      stage: 'contract',
      expectedCloseDate: '2025-04-15',
      probability: 80,
      salesRep: '王明',
      dealCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '深圳腾飞科技' } },
    },
    {
      title: '启航-在线教育平台',
      amount: 300000,
      stage: 'proposal',
      expectedCloseDate: '2025-05-30',
      probability: 50,
      salesRep: '李芳',
      dealCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '北京启航教育' } },
    },
    {
      title: '盛达-供应链管理',
      amount: 800000,
      stage: 'won',
      expectedCloseDate: '2025-03-01',
      probability: 100,
      salesRep: '张伟',
      dealCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '上海盛达贸易' } },
    },
    {
      title: '智云-数据分析平台',
      amount: 200000,
      stage: 'qualification',
      expectedCloseDate: '2025-06-30',
      probability: 30,
      salesRep: '赵丽',
      dealCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '杭州智云数据' } },
    },
  ],
};

const crmContracts: SampleBatch = {
  collection: 'contracts',
  records: [
    {
      contractNo: 'HT-2025-001',
      title: '盛达供应链管理系统合同',
      amount: 800000,
      startDate: '2025-03-01',
      endDate: '2025-12-31',
      status: 'executing',
      signee: '张伟',
      contractCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '上海盛达贸易' } },
    },
    {
      contractNo: 'HT-2025-002',
      title: '腾飞ERP升级服务合同',
      amount: 500000,
      startDate: '2025-04-01',
      endDate: '2025-09-30',
      status: 'draft',
      signee: '王明',
      contractCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '深圳腾飞科技' } },
    },
  ],
};

const crmServiceTickets: SampleBatch = {
  collection: 'service_tickets',
  records: [
    {
      ticketNo: 'TK-2025-001',
      title: '系统登录异常',
      type: 'bug',
      status: 'processing',
      priority: 'high',
      handler: '李工',
      ticketCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '上海盛达贸易' } },
    },
    {
      ticketNo: 'TK-2025-002',
      title: '报表功能咨询',
      type: 'consultation',
      status: 'resolved',
      priority: 'low',
      handler: '赵敏',
      ticketCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '深圳腾飞科技' } },
    },
  ],
};

const crmActivities: SampleBatch = {
  collection: 'activities',
  records: [
    {
      title: '腾飞项目需求讨论会',
      type: 'meeting',
      startTime: '2025-03-20T09:00:00',
      endTime: '2025-03-20T11:00:00',
      organizer: '王明',
      activityCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '深圳腾飞科技' } },
    },
    {
      title: '启航项目回访',
      type: 'visit',
      startTime: '2025-03-25T14:00:00',
      endTime: '2025-03-25T16:00:00',
      organizer: '李芳',
      activityCustomerId: { __ref: 'customers', __field: 'id', __match: { companyName: '北京启航教育' } },
    },
  ],
};

// ─── HR ───────────────────────────────────────────────────

const hrDepartments: SampleBatch = {
  collection: 'departments',
  records: [
    { name: '技术研发部', code: 'D001', manager: '李明', headcount: 50, status: 'active' },
    { name: '产品设计部', code: 'D002', manager: '王芳', headcount: 20, status: 'active' },
    { name: '市场营销部', code: 'D003', manager: '赵刚', headcount: 15, status: 'active' },
    { name: '人力资源部', code: 'D004', manager: '张丽', headcount: 8, status: 'active' },
    { name: '财务部', code: 'D005', manager: '刘强', headcount: 10, status: 'active' },
  ],
};

const hrPositions: SampleBatch = {
  collection: 'positions',
  records: [
    {
      title: '高级前端工程师',
      code: 'P001',
      level: 'senior',
      status: 'active',
      positionDeptId: { __ref: 'departments', __field: 'id', __match: { name: '技术研发部' } },
    },
    {
      title: 'Java后端开发',
      code: 'P002',
      level: 'mid',
      status: 'active',
      positionDeptId: { __ref: 'departments', __field: 'id', __match: { name: '技术研发部' } },
    },
    {
      title: '产品经理',
      code: 'P003',
      level: 'senior',
      status: 'filled',
      positionDeptId: { __ref: 'departments', __field: 'id', __match: { name: '产品设计部' } },
    },
    {
      title: '市场专员',
      code: 'P004',
      level: 'junior',
      status: 'active',
      positionDeptId: { __ref: 'departments', __field: 'id', __match: { name: '市场营销部' } },
    },
  ],
};

const hrEmployees: SampleBatch = {
  collection: 'employees',
  records: [
    {
      name: '张三',
      employeeId: 'E001',
      gender: 'male',
      phone: '13800000001',
      email: 'zhangsan@company.com',
      hireDate: '2022-03-15',
      status: 'active',
      education: 'bachelor',
      employeeDeptId: { __ref: 'departments', __field: 'id', __match: { name: '技术研发部' } },
    },
    {
      name: '李四',
      employeeId: 'E002',
      gender: 'female',
      phone: '13800000002',
      email: 'lisi@company.com',
      hireDate: '2023-06-01',
      status: 'active',
      education: 'master',
      employeeDeptId: { __ref: 'departments', __field: 'id', __match: { name: '产品设计部' } },
    },
    {
      name: '王五',
      employeeId: 'E003',
      gender: 'male',
      phone: '13800000003',
      email: 'wangwu@company.com',
      hireDate: '2025-01-10',
      status: 'probation',
      education: 'bachelor',
      employeeDeptId: { __ref: 'departments', __field: 'id', __match: { name: '技术研发部' } },
    },
    {
      name: '赵六',
      employeeId: 'E004',
      gender: 'female',
      phone: '13800000004',
      email: 'zhaoliu@company.com',
      hireDate: '2024-09-01',
      status: 'active',
      education: 'master',
      employeeDeptId: { __ref: 'departments', __field: 'id', __match: { name: '市场营销部' } },
    },
  ],
};

const hrLeaveRequests: SampleBatch = {
  collection: 'leave_requests',
  records: [
    {
      type: 'annual',
      startDate: '2025-03-10',
      endDate: '2025-03-12',
      days: 3,
      reason: '家庭旅行',
      status: 'approved',
      applicant: '张三',
      approver: '李明',
      leaveEmployeeId: { __ref: 'employees', __field: 'id', __match: { employeeId: 'E001' } },
    },
    {
      type: 'sick',
      startDate: '2025-03-05',
      endDate: '2025-03-06',
      days: 2,
      reason: '感冒发烧',
      status: 'approved',
      applicant: '李四',
      approver: '王芳',
      leaveEmployeeId: { __ref: 'employees', __field: 'id', __match: { employeeId: 'E002' } },
    },
    {
      type: 'personal',
      startDate: '2025-03-20',
      endDate: '2025-03-20',
      days: 1,
      reason: '办理个人事务',
      status: 'pending',
      applicant: '赵六',
      approver: '赵刚',
      leaveEmployeeId: { __ref: 'employees', __field: 'id', __match: { employeeId: 'E004' } },
    },
  ],
};

const hrRecruitments: SampleBatch = {
  collection: 'recruitments',
  records: [
    {
      positionTitle: '高级前端工程师',
      headcount: 2,
      urgency: 'high',
      status: 'open',
      publishDate: '2025-02-01',
      deadline: '2025-04-30',
      recruiter: '张丽',
      recruitDeptId: { __ref: 'departments', __field: 'id', __match: { name: '技术研发部' } },
      recruitPositionId: { __ref: 'positions', __field: 'id', __match: { title: '高级前端工程师' } },
    },
    {
      positionTitle: '市场专员',
      headcount: 1,
      urgency: 'medium',
      status: 'interviewing',
      publishDate: '2025-01-15',
      deadline: '2025-03-31',
      recruiter: '张丽',
      recruitDeptId: { __ref: 'departments', __field: 'id', __match: { name: '市场营销部' } },
      recruitPositionId: { __ref: 'positions', __field: 'id', __match: { title: '市场专员' } },
    },
  ],
};

const hrCandidates: SampleBatch = {
  collection: 'candidates',
  records: [
    {
      name: '周明',
      phone: '13900001111',
      email: 'zhouming@email.com',
      education: 'master',
      workYears: 5,
      status: 'interviewing',
      source: 'website',
      applyDate: '2025-02-10',
      candidateRecruitId: { __ref: 'recruitments', __field: 'id', __match: { positionTitle: '高级前端工程师' } },
    },
    {
      name: '吴芳',
      phone: '13900002222',
      email: 'wufang@email.com',
      education: 'bachelor',
      workYears: 3,
      status: 'screening',
      source: 'referral',
      applyDate: '2025-02-15',
      candidateRecruitId: { __ref: 'recruitments', __field: 'id', __match: { positionTitle: '高级前端工程师' } },
    },
    {
      name: '郑华',
      phone: '13900003333',
      email: 'zhenghua@email.com',
      education: 'bachelor',
      workYears: 2,
      status: 'offered',
      source: 'campus',
      applyDate: '2025-01-20',
      candidateRecruitId: { __ref: 'recruitments', __field: 'id', __match: { positionTitle: '市场专员' } },
    },
  ],
};

const hrTraining: SampleBatch = {
  collection: 'training_records',
  records: [
    {
      title: '新员工入职培训',
      type: 'orientation',
      startDate: '2025-01-15',
      endDate: '2025-01-17',
      trainer: '张丽',
      participants: 5,
      status: 'completed',
    },
    {
      title: 'React高级开发技巧',
      type: 'skill',
      startDate: '2025-03-20',
      endDate: '2025-03-22',
      trainer: '李明',
      participants: 15,
      status: 'planned',
    },
  ],
};

// ─── CMS ──────────────────────────────────────────────────

const cmsCategories: SampleBatch = {
  collection: 'categories',
  records: [
    { name: '技术教程', slug: 'tutorials', sort: 1, status: 'active' },
    { name: '行业动态', slug: 'industry-news', sort: 2, status: 'active' },
    { name: '产品更新', slug: 'product-updates', sort: 3, status: 'active' },
    { name: '团队分享', slug: 'team-sharing', sort: 4, status: 'active' },
  ],
};

const cmsTags: SampleBatch = {
  collection: 'tags',
  records: [
    { name: 'JavaScript', slug: 'javascript', color: '#f0db4f' },
    { name: 'React', slug: 'react', color: '#61dafb' },
    { name: 'NocoBase', slug: 'nocobase', color: '#1890ff' },
    { name: '低代码', slug: 'low-code', color: '#52c41a' },
    { name: 'API', slug: 'api', color: '#722ed1' },
  ],
};

const cmsAuthors: SampleBatch = {
  collection: 'authors',
  records: [
    { name: '技术小明', email: 'xiaoming@blog.com', bio: '全栈工程师，热爱开源', status: 'active' },
    { name: '产品大师', email: 'master@blog.com', bio: '10年产品经验，专注企业级应用', status: 'active' },
    { name: '设计艺术家', email: 'artist@blog.com', bio: 'UI/UX设计师', status: 'active' },
  ],
};

const cmsArticles: SampleBatch = {
  collection: 'articles',
  records: [
    {
      title: 'NocoBase入门指南：5分钟搭建企业应用',
      slug: 'nocobase-getting-started',
      status: 'published',
      publishDate: '2025-02-01',
      isTop: 'yes',
      wordCount: 3500,
      views: 1280,
      likes: 98,
      source: '原创',
      articleCategoryId: { __ref: 'categories', __field: 'id', __match: { name: '技术教程' } },
      articleAuthorId: { __ref: 'authors', __field: 'id', __match: { name: '技术小明' } },
    },
    {
      title: '2025年低代码平台发展趋势分析',
      slug: 'low-code-trends-2025',
      status: 'published',
      publishDate: '2025-02-15',
      isTop: 'no',
      wordCount: 4200,
      views: 856,
      likes: 67,
      source: '原创',
      articleCategoryId: { __ref: 'categories', __field: 'id', __match: { name: '行业动态' } },
      articleAuthorId: { __ref: 'authors', __field: 'id', __match: { name: '产品大师' } },
    },
    {
      title: 'React最佳实践2025',
      slug: 'react-best-practices',
      status: 'draft',
      isTop: 'no',
      wordCount: 2800,
      views: 0,
      likes: 0,
      source: '原创',
      articleCategoryId: { __ref: 'categories', __field: 'id', __match: { name: '技术教程' } },
      articleAuthorId: { __ref: 'authors', __field: 'id', __match: { name: '技术小明' } },
    },
    {
      title: 'NocoBase v2.0新功能预览',
      slug: 'nocobase-v2-preview',
      status: 'review',
      isTop: 'no',
      wordCount: 1800,
      views: 0,
      likes: 0,
      source: '原创',
      articleCategoryId: { __ref: 'categories', __field: 'id', __match: { name: '产品更新' } },
      articleAuthorId: { __ref: 'authors', __field: 'id', __match: { name: '产品大师' } },
    },
    {
      title: '打造高效团队的秘诀',
      slug: 'team-efficiency',
      status: 'published',
      publishDate: '2025-01-20',
      isTop: 'no',
      wordCount: 2200,
      views: 432,
      likes: 45,
      source: '原创',
      articleCategoryId: { __ref: 'categories', __field: 'id', __match: { name: '团队分享' } },
      articleAuthorId: { __ref: 'authors', __field: 'id', __match: { name: '设计艺术家' } },
    },
  ],
};

const cmsComments: SampleBatch = {
  collection: 'comments',
  records: [
    {
      author: '用户A',
      email: 'a@example.com',
      content: '写得非常好，很有帮助！',
      status: 'approved',
      likes: 12,
      commentArticleId: { __ref: 'articles', __field: 'id', __match: { slug: 'nocobase-getting-started' } },
    },
    {
      author: '用户B',
      email: 'b@example.com',
      content: '期待更多类似的教程',
      status: 'approved',
      likes: 8,
      commentArticleId: { __ref: 'articles', __field: 'id', __match: { slug: 'nocobase-getting-started' } },
    },
    {
      author: '匿名',
      email: '',
      content: '测试评论',
      status: 'pending',
      likes: 0,
      commentArticleId: { __ref: 'articles', __field: 'id', __match: { slug: 'low-code-trends-2025' } },
    },
  ],
};

const cmsPages: SampleBatch = {
  collection: 'pages',
  records: [
    { title: '关于我们', slug: 'about', status: 'published', sort: 1 },
    { title: '联系我们', slug: 'contact', status: 'published', sort: 2 },
    { title: '隐私政策', slug: 'privacy', status: 'published', sort: 3 },
  ],
};

const cmsNewsletters: SampleBatch = {
  collection: 'newsletters',
  records: [
    {
      subject: '2025年2月技术周报',
      status: 'sent',
      scheduledAt: '2025-02-28T08:00:00',
      sentAt: '2025-02-28T08:01:23',
      recipientCount: 520,
      openCount: 312,
      sender: '技术小明',
    },
    {
      subject: '产品更新通知 - v2.0即将发布',
      status: 'scheduled',
      scheduledAt: '2025-03-15T09:00:00',
      recipientCount: 520,
      sender: '产品大师',
    },
  ],
};

// ─── Export ───────────────────────────────────────────────

export const templateSampleData: Record<string, SampleBatch[]> = {
  'project-management': [pmProjects, pmTasks, pmMilestones, pmRisks, pmIssues],
  crm: [crmCustomers, crmContacts, crmDeals, crmContracts, crmServiceTickets, crmActivities],
  hr: [hrDepartments, hrPositions, hrEmployees, hrLeaveRequests, hrRecruitments, hrCandidates, hrTraining],
  cms: [cmsCategories, cmsTags, cmsAuthors, cmsArticles, cmsComments, cmsPages, cmsNewsletters],
};

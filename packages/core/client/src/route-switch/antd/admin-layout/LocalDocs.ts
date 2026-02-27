/**
 * Local documentation - available offline for AI learning and reference.
 * 本地文档 - 无需联网即可查看，便于 AI 学习和参考。
 */

export const LOCAL_DOCS = {
  'getting-started': {
    title: '快速开始',
    titleEn: 'Getting Started',
    content: `
## NocoBase 快速参考

### 创建应用
1. 多应用管理 -> 添加应用
2. 选择模板（项目管理/CRM/人事/内容）或空白
3. 安装后自动创建数据表、页面、工作流

### 数据表
- 在「数据表」中管理集合和字段
- 支持 input/select/date/richText 等类型

### 页面
- 表格/表单/看板/日历/甘特图
- 拖拽配置列、操作、筛选

### 工作流
- 从模板创建：数据变更/定时任务
- 或新建后添加触发器和节点
`,
  },
  'ui-schema': {
    title: 'UI Schema 概述',
    titleEn: 'UI Schema Overview',
    content: `
## UI Schema

UI Schema 是 NocoBase 的声明式界面配置方式，使用 JSON 描述界面结构。

### 核心属性
- \`x-component\`: 组件类型，如 TableV2, FormV2, Action.Drawer
- \`x-decorator\`: 装饰器，如 FormBlockProvider, TableBlockProvider
- \`x-initializer\`: 初始化器，用于动态添加子节点
- \`x-component-props\`: 组件属性
- \`x-decorator-props\`: 装饰器属性
- \`x-acl-action\`: 权限动作，如 users:list, users:create

### 常用区块
- Table: 表格区块，x-decorator: TableBlockProvider
- Form: 表单区块，x-decorator: FormBlockProvider
- Details: 详情区块，x-decorator: DetailsBlockProvider
- Kanban: 看板区块，x-decorator: KanbanBlockProvider
- Calendar: 日历区块，x-decorator: CalendarBlockProvider
- Gantt: 甘特图区块，x-decorator: GanttBlockProvider
`,
  },
  'blocks': {
    title: '数据区块',
    titleEn: 'Data Blocks',
    content: `
## 数据区块类型

### Table 表格
- 用于列表展示，支持分页、排序、筛选
- x-initializer: table:configureColumns 配置列
- x-initializer: table:configureItemActions 配置行操作

### Form 表单
- 用于创建/编辑数据
- FormBlockProvider + useCreateFormBlockDecoratorProps: 创建表单
- FormBlockProvider + useEditFormBlockDecoratorProps: 编辑表单

### Kanban 看板
- 按某字段分组展示卡片
- 需要 groupField 配置分组字段

### Calendar 日历
- 按日期展示事件
- 需要 titleField, startDateField, endDateField

### Gantt 甘特图
- 项目任务时间线
- 需要 titleField, startField, endField, progressField
`,
  },
  'workflow': {
    title: '工作流',
    titleEn: 'Workflow',
    content: `
## 工作流

### 触发器类型
- collection: 数据表事件，数据新增/更新/删除时触发
- schedule: 定时任务，按 cron 表达式执行
- form: 表单提交触发（需插件支持）

### 常用节点
- condition: 条件分支
- calculation: 计算表达式
- create: 创建记录
- update: 更新记录
- destroy: 删除记录
- query: 查询记录

### AI 集成
安装 @nocobase/plugin-workflow-ai 可添加 AI 节点：
- 智能数据分析
- 自然语言生成
- 自动分类标签
`,
  },
  'actions': {
    title: '操作类型',
    titleEn: 'Actions',
    content: `
## 常用操作

- Action.Drawer: 抽屉中展示内容
- Action.Modal: 弹窗中展示内容
- Action.Link: 链接式操作
- CreateRecordAction: 创建记录
- UpdateActionInitializer: 编辑
- DestroyActionInitializer: 删除

### 弹窗内容
- popup:addTab: 添加标签页
- popup:common:addBlock: 添加区块到弹窗
- popup:addNew:addBlock: 添加区块到新建弹窗
`,
  },
  'variables': {
    title: '变量与表达式',
    titleEn: 'Variables & Expressions',
    content: `
## 变量

### 记录变量
- $nRecord: 当前表格行/表单记录
- $nPopupRecord: 弹窗内当前记录
- $nParentRecord: 父级记录

### 系统变量
- $nNow: 当前时间
- $nUser: 当前用户

### 表达式
- {{ $nRecord.fieldName }}: 引用字段值
- {{ $nUser.nickname }}: 引用用户昵称
`,
  },
  'api': {
    title: 'API 参考',
    titleEn: 'API Reference',
    content: `
## 常用 API

### 数据操作
- workflows:create - 创建工作流
- workflows:list - 工作流列表
- collections/{name}:create - 创建记录
- collections/{name}:list - 列表查询
- collections/{name}:get - 单条查询
- collections/{name}:update - 更新
- collections/{name}:destroy - 删除

### 资源路径
- /api/workflows:create
- /api/collections/{collectionName}:create
`,
  },
  'workflow-templates': {
    title: '工作流模板',
    titleEn: 'Workflow Templates',
    content: `
## 内置工作流模板

### 集合触发 (collection)
- mode 1: 新增 (CREATE)
- mode 2: 更新 (UPDATE)
- mode 4: 删除 (DESTROY)
- mode 7: 新增|更新|删除 (1|2|4)

### 定时触发 (schedule)
- cron: 0 9 * * * 每日9点
- cron: 0 * * * * 每小时
- cron: 0 9 * * 1 每周一9点

### 创建流程
1. 选择模板 -> 集合类型需选数据表
2. 创建工作流 -> 跳转编辑页
3. 添加节点 -> condition/update/create 等
`,
  },
};

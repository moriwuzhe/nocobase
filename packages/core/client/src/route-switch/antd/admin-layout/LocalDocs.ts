/**
 * Local documentation - available offline for AI learning and reference.
 * 本地文档 - 无需联网即可查看，便于 AI 学习和参考。
 */

export const LOCAL_DOCS = {
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
};

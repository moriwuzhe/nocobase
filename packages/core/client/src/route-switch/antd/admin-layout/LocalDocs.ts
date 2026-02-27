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
  'schema-examples': {
    title: 'Schema 示例',
    titleEn: 'Schema Examples',
    content: `
## 简单表单区块

\`\`\`json
{
  "type": "void",
  "x-decorator": "FormBlockProvider",
  "x-decorator-props": {
    "collection": "users",
    "action": "get",
    "dataSource": "main"
  },
  "x-component": "CardItem",
  "properties": {
    "form": {
      "type": "void",
      "x-component": "FormV2",
      "properties": {
        "grid": {
          "type": "void",
          "x-component": "Grid",
          "properties": {
            "name": {
              "type": "string",
              "x-component": "CollectionField",
              "x-decorator": "FormItem",
              "x-collection-field": "users.name"
            }
          }
        }
      }
    }
  }
}
\`\`\`

## 表格区块

\`\`\`json
{
  "type": "void",
  "x-decorator": "TableBlockProvider",
  "x-decorator-props": {
    "collection": "users",
    "action": "list",
    "dataSource": "main"
  },
  "x-component": "CardItem",
  "properties": {
    "table": {
      "type": "void",
      "x-component": "TableV2",
      "x-initializer": "table:configureColumns"
    }
  }
}
\`\`\`
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

### 工作流变量
- $context: 触发器上下文，如 $context.data 为触发记录
- $jobsMapByNodeKey: 按节点 key 索引的已执行节点结果
- $system.now: 当前系统时间
- 示例: {{$context.data.title}} 引用触发记录的 title 字段
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

### Cron 表达式
格式: 分 时 日 月 周
- 0 9 * * * 每天9:00
- 0 * * * * 每小时整点
- 0 9 * * 1 每周一9:00
- 0 9 1 * * 每月1号9:00
- */15 * * * * 每15分钟
`,
  },
  'troubleshooting': {
    title: '常见问题',
    titleEn: 'Troubleshooting',
    content: `
## 常见问题

### 日历点击添加无反应
- 确保使用内置模板创建的日历页面
- 检查数据表是否有 create 权限
- 日历区块设置中「快速创建」需开启

### 详情/编辑白屏
- 多为 Record 上下文在弹窗中丢失
- 使用 PopupRecordProvider 包裹弹窗内表单
- 检查 FormBlockProvider 的 collection 配置

### 工作流创建失败
- 集合类型触发器需先选择数据表
- 检查 workflows:create 接口权限
- 定时任务需填写合法 cron 表达式

### 503/502 启动错误
- 应用启动中，可等待几秒重试
- CurrentAppInfoProvider 已内置重试逻辑
- 检查子应用是否正常启动

### 模板安装失败
- 确认子应用已创建且可访问
- 检查网络和 API 权限
- 查看控制台具体错误信息
`,
  },
  'collection-fields': {
    title: '集合字段类型',
    titleEn: 'Collection Field Types',
    content: `
## 常用字段

- input: 单行文本
- textarea: 多行文本
- richText: 富文本
- select: 下拉选择 (enum)
- number: 数字
- percent: 百分比
- date: 日期
- datetime: 日期时间
- money: 金额
- email: 邮箱
- phone: 电话
- url: 链接

### 关联
- belongsTo: 多对一
- hasMany: 一对多
- belongsToMany: 多对多
`,
  },
};

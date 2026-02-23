import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'legalCases', title: '{{t("Cases")}}',
  fields: [
    { type: 'string', name: 'caseNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '案件编号', 'x-component': 'Input' } },
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: '案件名称', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'caseType', interface: 'select', uiSchema: { type: 'string', title: '案件类型', 'x-component': 'Select', enum: [{ label: '民事', value: 'civil' }, { label: '商事', value: 'commercial' }, { label: '劳动', value: 'labor' }, { label: '知识产权', value: 'ip' }, { label: '行政', value: 'administrative' }] } },
    { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: '状态', 'x-component': 'Select', enum: [{ label: '进行中', value: 'open' }, { label: '审理中', value: 'trial' }, { label: '已结案', value: 'closed' }, { label: '已撤诉', value: 'withdrawn' }] } },
    { type: 'string', name: 'priority', defaultValue: 'medium', interface: 'select', uiSchema: { type: 'string', title: '优先级', 'x-component': 'Select', enum: [{ label: '低', value: 'low' }, { label: '中', value: 'medium' }, { label: '高', value: 'high' }, { label: '紧急', value: 'urgent' }] } },
    { type: 'string', name: 'lawyer', interface: 'input', uiSchema: { type: 'string', title: '负责律师', 'x-component': 'Input' } },
    { type: 'string', name: 'client', interface: 'input', uiSchema: { type: 'string', title: '委托方', 'x-component': 'Input' } },
    { type: 'string', name: 'opponent', interface: 'input', uiSchema: { type: 'string', title: '对方当事人', 'x-component': 'Input' } },
    { type: 'string', name: 'court', interface: 'input', uiSchema: { type: 'string', title: '受理法院', 'x-component': 'Input' } },
    { type: 'float', name: 'claimAmount', interface: 'number', uiSchema: { type: 'number', title: '标的金额', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'date', name: 'filingDate', interface: 'datetime', uiSchema: { type: 'string', title: '立案日期', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'trialDate', interface: 'datetime', uiSchema: { type: 'string', title: '开庭日期', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: '案情摘要', 'x-component': 'RichText' } },
    { type: 'text', name: 'result', interface: 'textarea', uiSchema: { type: 'string', title: '判决结果', 'x-component': 'Input.TextArea' } },
  ],
});

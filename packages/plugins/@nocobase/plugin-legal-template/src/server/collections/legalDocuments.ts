import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'legalDocuments', title: '{{t("Documents")}}',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: '文书标题', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'docType', interface: 'select', uiSchema: { type: 'string', title: '文书类型', 'x-component': 'Select', enum: [{ label: '起诉状', value: 'complaint' }, { label: '答辩状', value: 'defense' }, { label: '证据材料', value: 'evidence' }, { label: '代理词', value: 'brief' }, { label: '判决书', value: 'judgment' }, { label: '合同', value: 'contract' }, { label: '律师函', value: 'letter' }] } },
    { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: '状态', 'x-component': 'Select', enum: [{ label: '草稿', value: 'draft' }, { label: '审核中', value: 'review' }, { label: '已定稿', value: 'finalized' }, { label: '已归档', value: 'archived' }] } },
    { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: '内容', 'x-component': 'RichText' } },
    { type: 'string', name: 'author', interface: 'input', uiSchema: { type: 'string', title: '起草人', 'x-component': 'Input' } },
    { type: 'string', name: 'reviewer', interface: 'input', uiSchema: { type: 'string', title: '审核人', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'case', target: 'legalCases', foreignKey: 'caseId', interface: 'm2o', uiSchema: { type: 'object', title: '关联案件', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'title', value: 'id' } } } },
  ],
});

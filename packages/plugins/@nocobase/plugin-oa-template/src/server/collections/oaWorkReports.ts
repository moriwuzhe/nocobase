import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'oaWorkReports', title: 'Work Reports', fields: [
  { type: 'belongsTo', name: 'author', target: 'users', foreignKey: 'authorId', interface: 'm2o', uiSchema: { type: 'object', title: 'Author', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }] } },
  { type: 'string', name: 'period', interface: 'input', uiSchema: { type: 'string', title: 'Period', 'x-component': 'Input' } },
  { type: 'text', name: 'completed', interface: 'richText', uiSchema: { type: 'string', title: 'Work Completed', 'x-component': 'RichText' } },
  { type: 'text', name: 'planned', interface: 'richText', uiSchema: { type: 'string', title: 'Work Planned', 'x-component': 'RichText' } },
  { type: 'text', name: 'issues', interface: 'textarea', uiSchema: { type: 'string', title: 'Issues & Blockers', 'x-component': 'Input.TextArea' } },
  { type: 'belongsTo', name: 'reviewer', target: 'users', foreignKey: 'reviewerId' },
  { type: 'text', name: 'reviewComment', interface: 'textarea', uiSchema: { type: 'string', title: 'Review Comment', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Reviewed', value: 'reviewed' }] } },
] });

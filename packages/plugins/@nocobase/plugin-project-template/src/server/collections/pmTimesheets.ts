import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'pmTimesheets', title: 'Timesheets',
  fields: [
    { type: 'belongsTo', name: 'project', target: 'pmProjects', foreignKey: 'projectId' },
    { type: 'belongsTo', name: 'task', target: 'pmTasks', foreignKey: 'taskId' },
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId', interface: 'm2o', uiSchema: { type: 'object', title: 'Team Member', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'date', name: 'date', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'hours', interface: 'number', uiSchema: { type: 'number', title: 'Hours', 'x-component': 'InputNumber', 'x-component-props': { precision: 1 } } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Work Description', 'x-component': 'Input.TextArea' } },
    { type: 'boolean', name: 'billable', defaultValue: true },
    { type: 'string', name: 'status', defaultValue: 'submitted', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }] } },
  ],
});

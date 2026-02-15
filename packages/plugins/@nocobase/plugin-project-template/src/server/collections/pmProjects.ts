import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'pmProjects', title: 'Projects',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Project Name', 'x-component': 'Input' } },
    { type: 'string', name: 'code', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Project Code', 'x-component': 'Input' } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
    { type: 'string', name: 'status', defaultValue: 'planning', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Planning', value: 'planning' }, { label: 'In Progress', value: 'in_progress' }, { label: 'On Hold', value: 'on_hold' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'string', name: 'priority', defaultValue: 'medium', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' }] } },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'budget', interface: 'number', uiSchema: { type: 'number', title: 'Budget', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'integer', name: 'progress', defaultValue: 0, interface: 'percent', uiSchema: { type: 'number', title: 'Progress (%)', 'x-component': 'InputNumber', 'x-component-props': { min: 0, max: 100 } } },
    { type: 'belongsTo', name: 'manager', target: 'users', foreignKey: 'managerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Project Manager', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'hasMany', name: 'tasks', target: 'pmTasks', foreignKey: 'projectId' },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'tickets', title: 'Tickets',
  fields: [
    { type: 'string', name: 'ticketNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Ticket #', 'x-component': 'Input' } },
    { type: 'string', name: 'subject', interface: 'input', uiSchema: { type: 'string', title: 'Subject', 'x-component': 'Input' } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Bug', value: 'bug' }, { label: 'Feature', value: 'feature' }, { label: 'Question', value: 'question' }, { label: 'Service', value: 'service' }] } },
    { type: 'string', name: 'priority', defaultValue: 'medium', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] } },
    { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Open', value: 'open' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Waiting', value: 'waiting' }, { label: 'Resolved', value: 'resolved' }, { label: 'Closed', value: 'closed' }] } },
    { type: 'belongsTo', name: 'submitter', target: 'users', foreignKey: 'submitterId', interface: 'm2o', uiSchema: { type: 'object', title: 'Submitter', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Assignee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'resolvedAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Resolved At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'integer', name: 'satisfaction', interface: 'number', uiSchema: { type: 'number', title: 'Satisfaction (1-5)', 'x-component': 'InputNumber', 'x-component-props': { min: 1, max: 5 } } },
    { type: 'text', name: 'resolution', interface: 'textarea', uiSchema: { type: 'string', title: 'Resolution', 'x-component': 'Input.TextArea' } },
    { type: 'jsonb', name: 'tags', defaultValue: [] },
  ],
});

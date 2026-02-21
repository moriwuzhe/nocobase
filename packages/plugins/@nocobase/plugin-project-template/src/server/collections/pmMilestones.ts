import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'pmMilestones', title: 'Milestones',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Milestone', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'project', target: 'pmProjects', foreignKey: 'projectId' },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Delayed', value: 'delayed' }] } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'pmTasks', title: 'Tasks',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Task Title', 'x-component': 'Input' } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
    { type: 'belongsTo', name: 'project', target: 'pmProjects', foreignKey: 'projectId', interface: 'm2o', uiSchema: { type: 'object', title: 'Project', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'status', defaultValue: 'todo', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'To Do', value: 'todo' }, { label: 'In Progress', value: 'in_progress' }, { label: 'In Review', value: 'in_review' }, { label: 'Done', value: 'done' }] } },
    { type: 'string', name: 'priority', defaultValue: 'medium', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }] } },
    { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Assignee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'estimatedHours', interface: 'number', uiSchema: { type: 'number', title: 'Estimated Hours', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'actualHours', interface: 'number', uiSchema: { type: 'number', title: 'Actual Hours', 'x-component': 'InputNumber' } },
    { type: 'belongsTo', name: 'parent', target: 'pmTasks', foreignKey: 'parentId' },
  ],
});

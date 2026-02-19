import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'hrOnboarding', title: 'Onboarding Checklist',
  fields: [
    { type: 'belongsTo', name: 'employee', target: 'hrEmployees', foreignKey: 'employeeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Employee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'task', interface: 'input', uiSchema: { type: 'string', title: 'Task', 'x-component': 'Input' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Documents', value: 'documents' }, { label: 'IT Setup', value: 'it' }, { label: 'Access Cards', value: 'access' }, { label: 'Training', value: 'training' }, { label: 'Introduction', value: 'intro' }, { label: 'Equipment', value: 'equipment' }] } },
    { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId' },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'boolean', name: 'completed', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Completed', 'x-component': 'Checkbox' } },
    { type: 'date', name: 'completedAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Completed At', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
  ],
});

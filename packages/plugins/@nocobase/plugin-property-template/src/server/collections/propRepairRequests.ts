import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'propRepairRequests', title: 'Repair Requests',
  fields: [
    { type: 'string', name: 'requestNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Request #', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'owner', target: 'propOwners', foreignKey: 'ownerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Owner', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Plumbing', value: 'plumbing' }, { label: 'Electrical', value: 'electrical' }, { label: 'HVAC', value: 'hvac' }, { label: 'Elevator', value: 'elevator' }, { label: 'Other', value: 'other' }] } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'priority', defaultValue: 'normal', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Emergency', value: 'emergency' }] } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Assigned', value: 'assigned' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Closed', value: 'closed' }] } },
    { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId' },
    { type: 'date', name: 'completedAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Completed At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'integer', name: 'satisfaction', interface: 'number', uiSchema: { type: 'number', title: 'Satisfaction (1-5)', 'x-component': 'InputNumber', 'x-component-props': { min: 1, max: 5 } } },
    { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: 'Repair Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  ],
});

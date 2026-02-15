import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'serviceRequests', title: 'Service Requests', fields: [
  { type: 'string', name: 'requestNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Request No', 'x-component': 'Input' } },
  { type: 'string', name: 'customerName', interface: 'input', uiSchema: { type: 'string', title: 'Customer', 'x-component': 'Input' } },
  { type: 'string', name: 'productName', interface: 'input', uiSchema: { type: 'string', title: 'Product', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Repair', value: 'repair' }, { label: 'Return', value: 'return' }, { label: 'Exchange', value: 'exchange' }, { label: 'Warranty', value: 'warranty' }, { label: 'Consultation', value: 'consultation' }] } },
  { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'priority', defaultValue: 'normal', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] } },
  { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Open', value: 'open' }, { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' }, { label: 'Resolved', value: 'resolved' }, { label: 'Closed', value: 'closed' }] } },
  { type: 'boolean', name: 'underWarranty', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Under Warranty', 'x-component': 'Checkbox' } },
  { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: 'Service Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId' },
  { type: 'integer', name: 'satisfaction', interface: 'number', uiSchema: { type: 'number', title: 'Satisfaction (1-5)', 'x-component': 'InputNumber', 'x-component-props': { min: 1, max: 5 } } },
  { type: 'text', name: 'resolution', interface: 'textarea', uiSchema: { type: 'string', title: 'Resolution', 'x-component': 'Input.TextArea' } },
] });

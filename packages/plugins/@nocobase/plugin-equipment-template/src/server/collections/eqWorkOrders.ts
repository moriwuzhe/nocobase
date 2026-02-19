import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'eqWorkOrders', title: 'Work Orders', fields: [
  { type: 'string', name: 'orderNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Order No', 'x-component': 'Input' } },
  { type: 'belongsTo', name: 'equipment', target: 'eqEquipment', foreignKey: 'equipmentId', interface: 'm2o', uiSchema: { type: 'object', title: 'Equipment', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Preventive', value: 'preventive' }, { label: 'Corrective', value: 'corrective' }, { label: 'Emergency', value: 'emergency' }, { label: 'Inspection', value: 'inspection' }] } },
  { type: 'string', name: 'priority', defaultValue: 'normal', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Emergency', value: 'emergency' }] } },
  { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  { type: 'belongsTo', name: 'assignee', target: 'users', foreignKey: 'assigneeId' },
  { type: 'date', name: 'scheduledDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Scheduled', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'completedDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Completed', 'x-component': 'DatePicker' } },
  { type: 'float', name: 'laborHours', interface: 'number', uiSchema: { type: 'number', title: 'Labor Hours', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'partsCost', interface: 'number', uiSchema: { type: 'number', title: 'Parts Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'totalCost', interface: 'number', uiSchema: { type: 'number', title: 'Total Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Open', value: 'open' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
  { type: 'text', name: 'resolution', interface: 'textarea', uiSchema: { type: 'string', title: 'Resolution', 'x-component': 'Input.TextArea' } },
] });

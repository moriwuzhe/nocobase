import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'contracts', title: 'Contracts', fields: [
  { type: 'string', name: 'contractNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Contract No', 'x-component': 'Input' } },
  { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Sales', value: 'sales' }, { label: 'Purchase', value: 'purchase' }, { label: 'Service', value: 'service' }, { label: 'Employment', value: 'employment' }, { label: 'NDA', value: 'nda' }, { label: 'Other', value: 'other' }] } },
  { type: 'string', name: 'partyA', interface: 'input', uiSchema: { type: 'string', title: 'Party A', 'x-component': 'Input' } },
  { type: 'string', name: 'partyB', interface: 'input', uiSchema: { type: 'string', title: 'Party B', 'x-component': 'Input' } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'date', name: 'signDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Sign Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' }, { label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Terminated', value: 'terminated' }] } },
  { type: 'boolean', name: 'autoRenew', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Auto Renew', 'x-component': 'Checkbox' } },
  { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
] });

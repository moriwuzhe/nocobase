import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'contractPayments', title: 'Contract Payments', fields: [
  { type: 'belongsTo', name: 'contract', target: 'contracts', foreignKey: 'contractId' },
  { type: 'string', name: 'milestone', interface: 'input', uiSchema: { type: 'string', title: 'Payment Milestone', 'x-component': 'Input' } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'percentage', interface: 'number', uiSchema: { type: 'number', title: 'Percentage (%)', 'x-component': 'InputNumber' } },
  { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'paidDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Paid Date', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Invoiced', value: 'invoiced' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }] } },
  { type: 'string', name: 'invoiceNo', interface: 'input', uiSchema: { type: 'string', title: 'Invoice No', 'x-component': 'Input' } },
] });

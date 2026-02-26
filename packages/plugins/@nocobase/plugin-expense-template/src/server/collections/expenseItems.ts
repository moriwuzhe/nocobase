import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'expenseItems', title: 'Expense Line Items', fields: [
  { type: 'belongsTo', name: 'claim', target: 'expenseClaims', foreignKey: 'claimId' },
  { type: 'string', name: 'category', interface: 'input', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Input' } },
  { type: 'date', name: 'date', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker' } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  { type: 'jsonb', name: 'receipts', defaultValue: [] },
] });

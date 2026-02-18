import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'expenseCategories', title: 'Expense Categories', fields: [
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Input' } },
  { type: 'float', name: 'monthlyLimit', interface: 'number', uiSchema: { type: 'number', title: 'Monthly Limit', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'boolean', name: 'requireReceipt', defaultValue: true },
  { type: 'boolean', name: 'active', defaultValue: true },
  { type: 'string', name: 'accountCode', interface: 'input', uiSchema: { type: 'string', title: 'Account Code', 'x-component': 'Input' } },
] });

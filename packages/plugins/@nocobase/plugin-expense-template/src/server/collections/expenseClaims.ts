import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'expenseClaims', title: 'Expense Claims', fields: [
  { type: 'string', name: 'claimNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Claim No', 'x-component': 'Input' } },
  { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
  { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Travel', value: 'travel' }, { label: 'Meal', value: 'meal' }, { label: 'Transport', value: 'transport' }, { label: 'Office', value: 'office' }, { label: 'Communication', value: 'communication' }, { label: 'Other', value: 'other' }] } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'date', name: 'expenseDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Expense Date', 'x-component': 'DatePicker' } },
  { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  { type: 'jsonb', name: 'receipts', defaultValue: [], comment: 'Attachment file IDs' },
  { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Paid', value: 'paid' }] } },
  { type: 'belongsTo', name: 'submitter', target: 'users', foreignKey: 'submitterId' },
  { type: 'belongsTo', name: 'approver', target: 'users', foreignKey: 'approverId' },
  { type: 'text', name: 'approverComment', interface: 'textarea', uiSchema: { type: 'string', title: 'Approver Comment', 'x-component': 'Input.TextArea' } },
] });

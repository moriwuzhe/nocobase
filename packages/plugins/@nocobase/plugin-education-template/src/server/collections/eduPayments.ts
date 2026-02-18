import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'eduPayments', title: 'Tuition Payments', fields: [
  { type: 'belongsTo', name: 'student', target: 'eduStudents', foreignKey: 'studentId' },
  { type: 'string', name: 'semester', interface: 'input', uiSchema: { type: 'string', title: 'Semester', 'x-component': 'Input' } },
  { type: 'float', name: 'tuition', interface: 'number', uiSchema: { type: 'number', title: 'Tuition', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'miscFees', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Misc Fees', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'discount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Discount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'totalDue', interface: 'number', uiSchema: { type: 'number', title: 'Total Due', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'amountPaid', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Paid', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'status', defaultValue: 'unpaid', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Unpaid', value: 'unpaid' }, { label: 'Partial', value: 'partial' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }] } },
  { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
] });

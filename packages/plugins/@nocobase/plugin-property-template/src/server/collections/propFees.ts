import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'propFees', title: 'Property Fees',
  fields: [
    { type: 'belongsTo', name: 'owner', target: 'propOwners', foreignKey: 'ownerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Owner', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'feeType', interface: 'select', uiSchema: { type: 'string', title: 'Fee Type', 'x-component': 'Select', enum: [{ label: 'Property Fee', value: 'property' }, { label: 'Water', value: 'water' }, { label: 'Electricity', value: 'electricity' }, { label: 'Gas', value: 'gas' }, { label: 'Parking', value: 'parking' }, { label: 'Other', value: 'other' }] } },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'period', interface: 'input', uiSchema: { type: 'string', title: 'Period (e.g. 2025-03)', 'x-component': 'Input' } },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'paidAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Paid At', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'status', defaultValue: 'unpaid', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Unpaid', value: 'unpaid' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }] } },
    { type: 'string', name: 'paymentMethod', interface: 'select', uiSchema: { type: 'string', title: 'Payment Method', 'x-component': 'Select', enum: [{ label: 'Cash', value: 'cash' }, { label: 'Bank Transfer', value: 'bank' }, { label: 'WeChat Pay', value: 'wechat' }, { label: 'Alipay', value: 'alipay' }] } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'crmPayments', title: 'Payments / Receivables',
  fields: [
    { type: 'string', name: 'paymentNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Payment No', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'contract', target: 'crmContracts', foreignKey: 'contractId' },
    { type: 'belongsTo', name: 'deal', target: 'crmDeals', foreignKey: 'dealId' },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'date', name: 'dueDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Due Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'paidDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Paid Date', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Partial', value: 'partial' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'string', name: 'paymentMethod', interface: 'select', uiSchema: { type: 'string', title: 'Method', 'x-component': 'Select', enum: [{ label: 'Bank Transfer', value: 'bank' }, { label: 'Check', value: 'check' }, { label: 'Cash', value: 'cash' }, { label: 'WeChat Pay', value: 'wechat' }, { label: 'Alipay', value: 'alipay' }, { label: 'Credit Card', value: 'credit_card' }] } },
    { type: 'string', name: 'invoiceNo', interface: 'input', uiSchema: { type: 'string', title: 'Invoice No', 'x-component': 'Input' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'procPayments', title: 'Supplier Payments', fields: [
  { type: 'string', name: 'paymentNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Payment No', 'x-component': 'Input' } },
  { type: 'belongsTo', name: 'supplier', target: 'procSuppliers', foreignKey: 'supplierId' },
  { type: 'belongsTo', name: 'purchaseOrder', target: 'procPurchaseOrders', foreignKey: 'purchaseOrderId' },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'date', name: 'paymentDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Payment Date', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'method', interface: 'select', uiSchema: { type: 'string', title: 'Method', 'x-component': 'Select', enum: [{ label: 'Bank Transfer', value: 'bank' }, { label: 'Check', value: 'check' }, { label: 'Draft', value: 'draft' }, { label: 'Cash', value: 'cash' }] } },
  { type: 'string', name: 'invoiceNo', interface: 'input', uiSchema: { type: 'string', title: 'Invoice No', 'x-component': 'Input' } },
  { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Paid', value: 'paid' }, { label: 'Cancelled', value: 'cancelled' }] } },
] });

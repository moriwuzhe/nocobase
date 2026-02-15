import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'procPurchaseOrders', title: 'Purchase Orders', fields: [
  { type: 'string', name: 'orderNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'PO Number', 'x-component': 'Input' } },
  { type: 'string', name: 'supplier', interface: 'input', uiSchema: { type: 'string', title: 'Supplier', 'x-component': 'Input' } },
  { type: 'float', name: 'totalAmount', interface: 'number', uiSchema: { type: 'number', title: 'Total Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'currency', defaultValue: 'CNY', interface: 'select', uiSchema: { type: 'string', title: 'Currency', 'x-component': 'Select', enum: [{ label: 'CNY', value: 'CNY' }, { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }] } },
  { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Approved', value: 'approved' }, { label: 'Ordered', value: 'ordered' }, { label: 'Received', value: 'received' }, { label: 'Cancelled', value: 'cancelled' }] } },
  { type: 'date', name: 'orderDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Order Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'expectedDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Expected Delivery', 'x-component': 'DatePicker' } },
  { type: 'belongsTo', name: 'requestedBy', target: 'users', foreignKey: 'requestedById', interface: 'm2o', uiSchema: { type: 'object', title: 'Requested By', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
] });

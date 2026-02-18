import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'procOrderItems', title: 'PO Line Items', fields: [
  { type: 'belongsTo', name: 'purchaseOrder', target: 'procPurchaseOrders', foreignKey: 'purchaseOrderId' },
  { type: 'string', name: 'itemName', interface: 'input', uiSchema: { type: 'string', title: 'Item', 'x-component': 'Input' } },
  { type: 'string', name: 'specification', interface: 'input', uiSchema: { type: 'string', title: 'Spec', 'x-component': 'Input' } },
  { type: 'integer', name: 'quantity', interface: 'number', uiSchema: { type: 'number', title: 'Qty', 'x-component': 'InputNumber' } },
  { type: 'string', name: 'unit', interface: 'input', uiSchema: { type: 'string', title: 'Unit', 'x-component': 'Input' } },
  { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'integer', name: 'receivedQty', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Received', 'x-component': 'InputNumber' } },
  { type: 'text', name: 'remark', interface: 'textarea', uiSchema: { type: 'string', title: 'Remark', 'x-component': 'Input.TextArea' } },
] });

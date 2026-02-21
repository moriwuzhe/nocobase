import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'procReceiving', title: 'Receiving Records', fields: [
  { type: 'string', name: 'receiveNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Receive No', 'x-component': 'Input' } },
  { type: 'belongsTo', name: 'purchaseOrder', target: 'procPurchaseOrders', foreignKey: 'purchaseOrderId' },
  { type: 'date', name: 'receiveDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker' } },
  { type: 'belongsTo', name: 'receiver', target: 'users', foreignKey: 'receiverId' },
  { type: 'string', name: 'warehouse', interface: 'input', uiSchema: { type: 'string', title: 'Warehouse', 'x-component': 'Input' } },
  { type: 'string', name: 'qualityResult', interface: 'select', uiSchema: { type: 'string', title: 'Quality Check', 'x-component': 'Select', enum: [{ label: 'Pass', value: 'pass' }, { label: 'Partial', value: 'partial' }, { label: 'Fail', value: 'fail' }] } },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
] });

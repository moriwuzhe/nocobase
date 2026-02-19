import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'invStockMovements', title: 'Stock Movements',
  fields: [
    { type: 'string', name: 'movementNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Movement #', 'x-component': 'Input' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Purchase In', value: 'purchase_in' }, { label: 'Sales Out', value: 'sales_out' }, { label: 'Transfer', value: 'transfer' }, { label: 'Adjustment', value: 'adjustment' }, { label: 'Return In', value: 'return_in' }, { label: 'Return Out', value: 'return_out' }] } },
    { type: 'belongsTo', name: 'product', target: 'invProducts', foreignKey: 'productId', interface: 'm2o', uiSchema: { type: 'object', title: 'Product', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'integer', name: 'quantity', interface: 'number', uiSchema: { type: 'number', title: 'Quantity', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'totalAmount', interface: 'number', uiSchema: { type: 'number', title: 'Total Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'warehouse', interface: 'input', uiSchema: { type: 'string', title: 'Warehouse', 'x-component': 'Input' } },
    { type: 'string', name: 'counterparty', interface: 'input', uiSchema: { type: 'string', title: 'Supplier/Customer', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'operator', target: 'users', foreignKey: 'operatorId' },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'completed', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'ecOrderItems', title: 'Order Items',
  fields: [
    { type: 'belongsTo', name: 'order', target: 'ecOrders', foreignKey: 'orderId' },
    { type: 'belongsTo', name: 'product', target: 'ecProducts', foreignKey: 'productId', interface: 'm2o', uiSchema: { type: 'object', title: 'Product', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'productName', interface: 'input', uiSchema: { type: 'string', title: 'Product Name', 'x-component': 'Input' } },
    { type: 'string', name: 'sku', interface: 'input', uiSchema: { type: 'string', title: 'SKU', 'x-component': 'Input' } },
    { type: 'integer', name: 'quantity', defaultValue: 1, interface: 'number', uiSchema: { type: 'number', title: 'Qty', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'subtotal', interface: 'number', uiSchema: { type: 'number', title: 'Subtotal', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  ],
});

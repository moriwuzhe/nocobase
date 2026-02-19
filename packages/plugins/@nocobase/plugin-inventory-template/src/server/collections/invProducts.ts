import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'invProducts', title: 'Products',
  fields: [
    { type: 'string', name: 'sku', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'SKU', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Product Name', 'x-component': 'Input' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Raw Material', value: 'raw' }, { label: 'Finished Good', value: 'finished' }, { label: 'Semi-finished', value: 'semi' }, { label: 'Consumable', value: 'consumable' }] } },
    { type: 'string', name: 'unit', defaultValue: 'pcs', interface: 'input', uiSchema: { type: 'string', title: 'Unit', 'x-component': 'Input' } },
    { type: 'float', name: 'costPrice', interface: 'number', uiSchema: { type: 'number', title: 'Cost Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'sellingPrice', interface: 'number', uiSchema: { type: 'number', title: 'Selling Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'integer', name: 'stockQty', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Stock Qty', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'minStock', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Min Stock Alert', 'x-component': 'InputNumber' } },
    { type: 'string', name: 'warehouse', interface: 'input', uiSchema: { type: 'string', title: 'Warehouse', 'x-component': 'Input' } },
    { type: 'boolean', name: 'active', defaultValue: true },
  ],
});

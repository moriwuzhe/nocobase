import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'crmProducts', title: 'Products / Price Book',
  fields: [
    { type: 'string', name: 'code', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Product Code', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Product Name', 'x-component': 'Input' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Software', value: 'software' }, { label: 'Hardware', value: 'hardware' }, { label: 'Service', value: 'service' }, { label: 'Subscription', value: 'subscription' }, { label: 'Consulting', value: 'consulting' }, { label: 'Training', value: 'training' }] } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
    { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'costPrice', interface: 'number', uiSchema: { type: 'number', title: 'Cost Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'unit', defaultValue: 'piece', interface: 'select', uiSchema: { type: 'string', title: 'Unit', 'x-component': 'Select', enum: [{ label: 'Piece', value: 'piece' }, { label: 'Set', value: 'set' }, { label: 'License', value: 'license' }, { label: 'Month', value: 'month' }, { label: 'Year', value: 'year' }, { label: 'Hour', value: 'hour' }, { label: 'Day', value: 'day' }] } },
    { type: 'boolean', name: 'active', defaultValue: true },
    { type: 'string', name: 'taxRate', interface: 'input', uiSchema: { type: 'string', title: 'Tax Rate (%)', 'x-component': 'Input' } },
  ],
});

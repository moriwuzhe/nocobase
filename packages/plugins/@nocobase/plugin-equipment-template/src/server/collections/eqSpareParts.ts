import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'eqSpareParts', title: 'Spare Parts', fields: [
  { type: 'string', name: 'partNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Part No', 'x-component': 'Input' } },
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Part Name', 'x-component': 'Input' } },
  { type: 'string', name: 'specification', interface: 'input', uiSchema: { type: 'string', title: 'Spec', 'x-component': 'Input' } },
  { type: 'integer', name: 'stock', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Stock', 'x-component': 'InputNumber' } },
  { type: 'integer', name: 'minStock', defaultValue: 5, interface: 'number', uiSchema: { type: 'number', title: 'Min Stock', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'warehouse', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
] });

import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'invWarehouses', title: 'Warehouses', fields: [
  { type: 'string', name: 'code', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Warehouse Code', 'x-component': 'Input' } },
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Name', 'x-component': 'Input' } },
  { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: 'Address', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'manager', interface: 'input', uiSchema: { type: 'string', title: 'Manager', 'x-component': 'Input' } },
  { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'boolean', name: 'active', defaultValue: true },
] });

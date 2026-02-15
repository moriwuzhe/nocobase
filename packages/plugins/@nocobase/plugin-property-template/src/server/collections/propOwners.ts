import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'propOwners', title: 'Owners',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Owner Name', 'x-component': 'Input' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
    { type: 'string', name: 'unit', interface: 'input', uiSchema: { type: 'string', title: 'Unit (e.g. 3-201)', 'x-component': 'Input' } },
    { type: 'string', name: 'building', interface: 'input', uiSchema: { type: 'string', title: 'Building', 'x-component': 'Input' } },
    { type: 'float', name: 'area', interface: 'number', uiSchema: { type: 'number', title: 'Area (m²)', 'x-component': 'InputNumber' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Owner', value: 'owner' }, { label: 'Tenant', value: 'tenant' }] } },
    { type: 'date', name: 'moveInDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Move-in Date', 'x-component': 'DatePicker' } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'invStockCheck', title: 'Stock Check / Inventory Count', fields: [
  { type: 'string', name: 'checkNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Check No', 'x-component': 'Input' } },
  { type: 'string', name: 'warehouse', interface: 'input', uiSchema: { type: 'string', title: 'Warehouse', 'x-component': 'Input' } },
  { type: 'date', name: 'checkDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Check Date', 'x-component': 'DatePicker' } },
  { type: 'belongsTo', name: 'checker', target: 'users', foreignKey: 'checkerId' },
  { type: 'string', name: 'status', defaultValue: 'in_progress', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Adjusted', value: 'adjusted' }] } },
  { type: 'integer', name: 'itemsChecked', defaultValue: 0 },
  { type: 'integer', name: 'discrepancies', defaultValue: 0 },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
] });

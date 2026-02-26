import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'vehicleMaintenance', title: 'Maintenance Records', fields: [
  { type: 'belongsTo', name: 'vehicle', target: 'vehicles', foreignKey: 'vehicleId' },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Regular Service', value: 'regular' }, { label: 'Repair', value: 'repair' }, { label: 'Tire Change', value: 'tire' }, { label: 'Accident', value: 'accident' }, { label: 'Inspection', value: 'inspection' }] } },
  { type: 'date', name: 'date', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker' } },
  { type: 'integer', name: 'mileageAtService', interface: 'number', uiSchema: { type: 'number', title: 'Mileage', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: 'Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'vendor', interface: 'input', uiSchema: { type: 'string', title: 'Vendor', 'x-component': 'Input' } },
  { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  { type: 'date', name: 'nextServiceDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Next Service', 'x-component': 'DatePicker' } },
] });

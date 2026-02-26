import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'vehicles', title: 'Vehicles', fields: [
  { type: 'string', name: 'plateNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Plate Number', 'x-component': 'Input' } },
  { type: 'string', name: 'brand', interface: 'input', uiSchema: { type: 'string', title: 'Brand/Model', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Sedan', value: 'sedan' }, { label: 'SUV', value: 'suv' }, { label: 'Van', value: 'van' }, { label: 'Truck', value: 'truck' }] } },
  { type: 'string', name: 'vin', interface: 'input', uiSchema: { type: 'string', title: 'VIN', 'x-component': 'Input' } },
  { type: 'integer', name: 'mileage', interface: 'number', uiSchema: { type: 'number', title: 'Mileage (km)', 'x-component': 'InputNumber' } },
  { type: 'string', name: 'status', defaultValue: 'available', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Available', value: 'available' }, { label: 'In Use', value: 'in_use' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Retired', value: 'retired' }] } },
  { type: 'date', name: 'insuranceExpiry', interface: 'datetime', uiSchema: { type: 'string', title: 'Insurance Expiry', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'inspectionExpiry', interface: 'datetime', uiSchema: { type: 'string', title: 'Inspection Expiry', 'x-component': 'DatePicker' } },
  { type: 'belongsTo', name: 'assignedTo', target: 'users', foreignKey: 'assignedToId' },
  { type: 'float', name: 'fuelCostPerKm', interface: 'number', uiSchema: { type: 'number', title: 'Fuel Cost/km', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
] });

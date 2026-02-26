import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'vehicleUsageLogs', title: 'Usage Logs', fields: [
  { type: 'belongsTo', name: 'vehicle', target: 'vehicles', foreignKey: 'vehicleId' },
  { type: 'belongsTo', name: 'driver', target: 'users', foreignKey: 'driverId' },
  { type: 'string', name: 'purpose', interface: 'input', uiSchema: { type: 'string', title: 'Purpose', 'x-component': 'Input' } },
  { type: 'date', name: 'startTime', interface: 'datetime', uiSchema: { type: 'string', title: 'Start', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'date', name: 'endTime', interface: 'datetime', uiSchema: { type: 'string', title: 'End', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'integer', name: 'startMileage', interface: 'number', uiSchema: { type: 'number', title: 'Start Mileage', 'x-component': 'InputNumber' } },
  { type: 'integer', name: 'endMileage', interface: 'number', uiSchema: { type: 'number', title: 'End Mileage', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'fuelCost', interface: 'number', uiSchema: { type: 'number', title: 'Fuel Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'tollCost', interface: 'number', uiSchema: { type: 'number', title: 'Toll Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'text', name: 'route', interface: 'textarea', uiSchema: { type: 'string', title: 'Route', 'x-component': 'Input.TextArea' } },
] });

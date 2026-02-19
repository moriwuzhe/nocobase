import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'eqEquipment', title: 'Equipment', fields: [
  { type: 'string', name: 'assetNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Asset No', 'x-component': 'Input' } },
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Equipment Name', 'x-component': 'Input' } },
  { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Mechanical', value: 'mechanical' }, { label: 'Electrical', value: 'electrical' }, { label: 'HVAC', value: 'hvac' }, { label: 'IT', value: 'it' }, { label: 'Safety', value: 'safety' }] } },
  { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
  { type: 'string', name: 'manufacturer', interface: 'input', uiSchema: { type: 'string', title: 'Manufacturer', 'x-component': 'Input' } },
  { type: 'string', name: 'model', interface: 'input', uiSchema: { type: 'string', title: 'Model', 'x-component': 'Input' } },
  { type: 'date', name: 'installDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Install Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'warrantyExpiry', interface: 'datetime', uiSchema: { type: 'string', title: 'Warranty Expiry', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'status', defaultValue: 'running', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Running', value: 'running' }, { label: 'Standby', value: 'standby' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Broken', value: 'broken' }, { label: 'Decommissioned', value: 'decommissioned' }] } },
  { type: 'date', name: 'nextMaintenanceDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Next Maintenance', 'x-component': 'DatePicker' } },
  { type: 'integer', name: 'maintenanceCycleDays', interface: 'number', uiSchema: { type: 'number', title: 'Maintenance Cycle (days)', 'x-component': 'InputNumber' } },
] });

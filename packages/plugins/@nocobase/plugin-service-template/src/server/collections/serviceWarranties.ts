import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'serviceWarranties', title: 'Warranties', fields: [
  { type: 'string', name: 'warrantyNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Warranty No', 'x-component': 'Input' } },
  { type: 'string', name: 'customerName', interface: 'input', uiSchema: { type: 'string', title: 'Customer', 'x-component': 'Input' } },
  { type: 'string', name: 'productName', interface: 'input', uiSchema: { type: 'string', title: 'Product', 'x-component': 'Input' } },
  { type: 'string', name: 'serialNo', interface: 'input', uiSchema: { type: 'string', title: 'Serial No', 'x-component': 'Input' } },
  { type: 'date', name: 'purchaseDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Purchase Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'expiryDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Expiry Date', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Standard', value: 'standard' }, { label: 'Extended', value: 'extended' }, { label: 'Premium', value: 'premium' }] } },
  { type: 'string', name: 'status', defaultValue: 'active', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Voided', value: 'voided' }] } },
  { type: 'text', name: 'coverage', interface: 'textarea', uiSchema: { type: 'string', title: 'Coverage', 'x-component': 'Input.TextArea' } },
] });

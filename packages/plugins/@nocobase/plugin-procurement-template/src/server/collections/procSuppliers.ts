import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'procSuppliers', title: 'Suppliers', fields: [
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Supplier Name', 'x-component': 'Input' } },
  { type: 'string', name: 'code', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Supplier Code', 'x-component': 'Input' } },
  { type: 'string', name: 'contactPerson', interface: 'input', uiSchema: { type: 'string', title: 'Contact Person', 'x-component': 'Input' } },
  { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
  { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: 'Address', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'bankName', interface: 'input', uiSchema: { type: 'string', title: 'Bank', 'x-component': 'Input' } },
  { type: 'string', name: 'bankAccount', interface: 'input', uiSchema: { type: 'string', title: 'Bank Account', 'x-component': 'Input' } },
  { type: 'string', name: 'taxId', interface: 'input', uiSchema: { type: 'string', title: 'Tax ID', 'x-component': 'Input' } },
  { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Raw Material', value: 'raw' }, { label: 'Equipment', value: 'equipment' }, { label: 'Service', value: 'service' }, { label: 'IT', value: 'it' }, { label: 'Office', value: 'office' }, { label: 'Logistics', value: 'logistics' }] } },
  { type: 'string', name: 'rating', interface: 'select', uiSchema: { type: 'string', title: 'Rating', 'x-component': 'Select', enum: [{ label: 'A (Excellent)', value: 'A' }, { label: 'B (Good)', value: 'B' }, { label: 'C (Average)', value: 'C' }, { label: 'D (Poor)', value: 'D' }] } },
  { type: 'string', name: 'status', defaultValue: 'active', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Active', value: 'active' }, { label: 'Blacklisted', value: 'blacklisted' }, { label: 'Inactive', value: 'inactive' }] } },
  { type: 'integer', name: 'paymentTermDays', defaultValue: 30, interface: 'number', uiSchema: { type: 'number', title: 'Payment Term (days)', 'x-component': 'InputNumber' } },
  { type: 'hasMany', name: 'purchaseOrders', target: 'procPurchaseOrders', foreignKey: 'supplierId' },
] });

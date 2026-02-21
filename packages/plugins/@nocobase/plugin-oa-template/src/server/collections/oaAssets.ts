import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'oaAssets',
  title: 'Assets',
  fields: [
    { type: 'string', name: 'assetCode', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Asset Code', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Asset Name', 'x-component': 'Input' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Computer', value: 'computer' }, { label: 'Monitor', value: 'monitor' }, { label: 'Phone', value: 'phone' }, { label: 'Furniture', value: 'furniture' }, { label: 'Vehicle', value: 'vehicle' }, { label: 'Other', value: 'other' }] } },
    { type: 'string', name: 'brand', interface: 'input', uiSchema: { type: 'string', title: 'Brand / Model', 'x-component': 'Input' } },
    { type: 'string', name: 'serialNumber', interface: 'input', uiSchema: { type: 'string', title: 'Serial Number', 'x-component': 'Input' } },
    { type: 'float', name: 'purchasePrice', interface: 'number', uiSchema: { type: 'number', title: 'Purchase Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'date', name: 'purchaseDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Purchase Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'warrantyExpiry', interface: 'datetime', uiSchema: { type: 'string', title: 'Warranty Expiry', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'status', defaultValue: 'in_use', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'In Use', value: 'in_use' }, { label: 'In Stock', value: 'in_stock' }, { label: 'Under Repair', value: 'repair' }, { label: 'Retired', value: 'retired' }, { label: 'Lost', value: 'lost' }] } },
    { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'assignedTo', target: 'users', foreignKey: 'assignedToId', interface: 'm2o', uiSchema: { type: 'object', title: 'Assigned To', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
  ],
});

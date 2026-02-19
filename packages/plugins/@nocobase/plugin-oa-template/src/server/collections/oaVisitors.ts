import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'oaVisitors', title: 'Visitor Management', fields: [
  { type: 'string', name: 'visitorName', interface: 'input', uiSchema: { type: 'string', title: 'Visitor Name', 'x-component': 'Input' } },
  { type: 'string', name: 'company', interface: 'input', uiSchema: { type: 'string', title: 'Company', 'x-component': 'Input' } },
  { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'string', name: 'idType', interface: 'select', uiSchema: { type: 'string', title: 'ID Type', 'x-component': 'Select', enum: [{ label: 'ID Card', value: 'id_card' }, { label: 'Passport', value: 'passport' }, { label: 'Driver License', value: 'driver' }] } },
  { type: 'string', name: 'idNumber', interface: 'input', uiSchema: { type: 'string', title: 'ID Number', 'x-component': 'Input' } },
  { type: 'string', name: 'purpose', interface: 'select', uiSchema: { type: 'string', title: 'Purpose', 'x-component': 'Select', enum: [{ label: 'Meeting', value: 'meeting' }, { label: 'Interview', value: 'interview' }, { label: 'Delivery', value: 'delivery' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Other', value: 'other' }] } },
  { type: 'belongsTo', name: 'host', target: 'users', foreignKey: 'hostId', interface: 'm2o', uiSchema: { type: 'object', title: 'Host', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
  { type: 'date', name: 'checkIn', interface: 'datetime', uiSchema: { type: 'string', title: 'Check In', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'date', name: 'checkOut', interface: 'datetime', uiSchema: { type: 'string', title: 'Check Out', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'string', name: 'status', defaultValue: 'expected', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Expected', value: 'expected' }, { label: 'Checked In', value: 'checked_in' }, { label: 'Checked Out', value: 'checked_out' }, { label: 'Cancelled', value: 'cancelled' }] } },
] });

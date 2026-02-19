import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'members', title: 'Members', fields: [
  { type: 'string', name: 'memberNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Member No', 'x-component': 'Input' } },
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Name', 'x-component': 'Input' } },
  { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
  { type: 'string', name: 'tier', defaultValue: 'standard', interface: 'select', uiSchema: { type: 'string', title: 'Tier', 'x-component': 'Select', enum: [{ label: 'Standard', value: 'standard' }, { label: 'Silver', value: 'silver' }, { label: 'Gold', value: 'gold' }, { label: 'Platinum', value: 'platinum' }, { label: 'Diamond', value: 'diamond' }] } },
  { type: 'integer', name: 'points', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Points', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'balance', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Card Balance', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'totalSpend', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Total Spend', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'date', name: 'joinDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Join Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'expiryDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Expiry Date', 'x-component': 'DatePicker' } },
  { type: 'string', name: 'status', defaultValue: 'active', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Frozen', value: 'frozen' }] } },
  { type: 'date', name: 'birthDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Birthday', 'x-component': 'DatePicker' } },
] });

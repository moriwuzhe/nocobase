import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'memberTierRules', title: 'Tier Rules', fields: [
  { type: 'string', name: 'tier', interface: 'select', uiSchema: { type: 'string', title: 'Tier', 'x-component': 'Select', enum: [{ label: 'Standard', value: 'standard' }, { label: 'Silver', value: 'silver' }, { label: 'Gold', value: 'gold' }, { label: 'Platinum', value: 'platinum' }, { label: 'Diamond', value: 'diamond' }] } },
  { type: 'float', name: 'minSpend', interface: 'number', uiSchema: { type: 'number', title: 'Min Annual Spend', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'discount', interface: 'number', uiSchema: { type: 'number', title: 'Discount %', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'pointsMultiplier', defaultValue: 1, interface: 'number', uiSchema: { type: 'number', title: 'Points Multiplier', 'x-component': 'InputNumber' } },
  { type: 'text', name: 'benefits', interface: 'textarea', uiSchema: { type: 'string', title: 'Benefits', 'x-component': 'Input.TextArea' } },
] });

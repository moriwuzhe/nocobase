import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'ecCoupons', title: 'Coupons',
  fields: [
    { type: 'string', name: 'code', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Coupon Code', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Name', 'x-component': 'Input' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Fixed Amount', value: 'fixed' }, { label: 'Percentage', value: 'percentage' }, { label: 'Free Shipping', value: 'free_shipping' }] } },
    { type: 'float', name: 'value', interface: 'number', uiSchema: { type: 'number', title: 'Value', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'minOrderAmount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Min Order Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'integer', name: 'maxUses', interface: 'number', uiSchema: { type: 'number', title: 'Max Uses', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'usedCount', defaultValue: 0 },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
    { type: 'boolean', name: 'active', defaultValue: true },
  ],
});

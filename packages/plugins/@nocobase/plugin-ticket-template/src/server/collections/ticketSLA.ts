import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'ticketSLA', title: 'SLA Policies',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'SLA Name', 'x-component': 'Input' } },
    { type: 'string', name: 'priority', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] } },
    { type: 'integer', name: 'firstResponseMinutes', interface: 'number', uiSchema: { type: 'number', title: 'First Response (min)', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'resolutionMinutes', interface: 'number', uiSchema: { type: 'number', title: 'Resolution (min)', 'x-component': 'InputNumber' } },
    { type: 'boolean', name: 'escalateOnBreach', defaultValue: true },
    { type: 'string', name: 'escalateTo', interface: 'input', uiSchema: { type: 'string', title: 'Escalate To', 'x-component': 'Input' } },
    { type: 'boolean', name: 'active', defaultValue: true },
  ],
});

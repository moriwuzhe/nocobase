import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'crmCampaigns', title: 'Campaigns',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Campaign Name', 'x-component': 'Input' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Email', value: 'email' }, { label: 'Social', value: 'social' }, { label: 'Content', value: 'content' }, { label: 'Event', value: 'event' }, { label: 'Webinar', value: 'webinar' }, { label: 'Advertisement', value: 'ad' }, { label: 'Referral', value: 'referral' }, { label: 'SEO', value: 'seo' }] } },
    { type: 'string', name: 'status', defaultValue: 'planned', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Planned', value: 'planned' }, { label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'budget', interface: 'number', uiSchema: { type: 'number', title: 'Budget', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'actualCost', interface: 'number', uiSchema: { type: 'number', title: 'Actual Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'integer', name: 'expectedLeads', interface: 'number', uiSchema: { type: 'number', title: 'Expected Leads', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'actualLeads', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Actual Leads', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'expectedRevenue', interface: 'number', uiSchema: { type: 'number', title: 'Expected Revenue', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'actualRevenue', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Actual Revenue', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
    { type: 'hasMany', name: 'leads', target: 'crmLeads', foreignKey: 'campaignId' },
  ],
});

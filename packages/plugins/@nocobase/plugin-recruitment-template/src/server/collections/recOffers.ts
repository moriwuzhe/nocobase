import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'recOffers', title: 'Offer Letters', fields: [
  { type: 'belongsTo', name: 'candidate', target: 'recCandidates', foreignKey: 'candidateId' },
  { type: 'belongsTo', name: 'job', target: 'recJobPostings', foreignKey: 'jobId' },
  { type: 'float', name: 'salary', interface: 'number', uiSchema: { type: 'number', title: 'Monthly Salary', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'level', interface: 'input', uiSchema: { type: 'string', title: 'Level/Grade', 'x-component': 'Input' } },
  { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
  { type: 'date', name: 'expiryDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Offer Expiry', 'x-component': 'DatePicker' } },
  { type: 'text', name: 'benefits', interface: 'textarea', uiSchema: { type: 'string', title: 'Benefits', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Sent', value: 'sent' }, { label: 'Accepted', value: 'accepted' }, { label: 'Declined', value: 'declined' }, { label: 'Withdrawn', value: 'withdrawn' }] } },
] });

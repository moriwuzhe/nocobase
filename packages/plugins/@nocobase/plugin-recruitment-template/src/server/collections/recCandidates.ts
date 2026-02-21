import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'recCandidates', title: 'Candidates', fields: [
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Name', 'x-component': 'Input' } },
  { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
  { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'belongsTo', name: 'job', target: 'recJobPostings', foreignKey: 'jobId', interface: 'm2o', uiSchema: { type: 'object', title: 'Applied Job', 'x-component': 'AssociationField' } },
  { type: 'string', name: 'stage', defaultValue: 'applied', interface: 'select', uiSchema: { type: 'string', title: 'Stage', 'x-component': 'Select', enum: [{ label: 'Applied', value: 'applied' }, { label: 'Screening', value: 'screening' }, { label: 'Interview', value: 'interview' }, { label: 'Offer', value: 'offer' }, { label: 'Hired', value: 'hired' }, { label: 'Rejected', value: 'rejected' }] } },
  { type: 'string', name: 'source', interface: 'select', uiSchema: { type: 'string', title: 'Source', 'x-component': 'Select', enum: [{ label: 'Website', value: 'website' }, { label: 'Referral', value: 'referral' }, { label: 'LinkedIn', value: 'linkedin' }, { label: 'Headhunter', value: 'headhunter' }] } },
  { type: 'integer', name: 'yearsOfExp', interface: 'number', uiSchema: { type: 'number', title: 'Years of Experience', 'x-component': 'InputNumber' } },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
] });

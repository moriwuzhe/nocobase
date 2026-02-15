import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'recJobPostings', title: 'Job Postings', fields: [
  { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Job Title', 'x-component': 'Input' } },
  { type: 'string', name: 'department', interface: 'input', uiSchema: { type: 'string', title: 'Department', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Full-time', value: 'fulltime' }, { label: 'Part-time', value: 'parttime' }, { label: 'Contract', value: 'contract' }, { label: 'Intern', value: 'intern' }] } },
  { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
  { type: 'text', name: 'requirements', interface: 'richText', uiSchema: { type: 'string', title: 'Requirements', 'x-component': 'RichText' } },
  { type: 'string', name: 'salaryRange', interface: 'input', uiSchema: { type: 'string', title: 'Salary Range', 'x-component': 'Input' } },
  { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
  { type: 'integer', name: 'headcount', defaultValue: 1, interface: 'number', uiSchema: { type: 'number', title: 'Headcount', 'x-component': 'InputNumber' } },
  { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }, { label: 'Filled', value: 'filled' }] } },
  { type: 'belongsTo', name: 'hiringManager', target: 'users', foreignKey: 'hiringManagerId' },
  { type: 'hasMany', name: 'candidates', target: 'recCandidates', foreignKey: 'jobId' },
] });

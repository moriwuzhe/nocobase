import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'recInterviews', title: 'Interviews', fields: [
  { type: 'belongsTo', name: 'candidate', target: 'recCandidates', foreignKey: 'candidateId' },
  { type: 'belongsTo', name: 'job', target: 'recJobPostings', foreignKey: 'jobId' },
  { type: 'belongsTo', name: 'interviewer', target: 'users', foreignKey: 'interviewerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Interviewer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
  { type: 'string', name: 'round', interface: 'select', uiSchema: { type: 'string', title: 'Round', 'x-component': 'Select', enum: [{ label: 'Phone Screen', value: 'phone' }, { label: 'Technical', value: 'technical' }, { label: 'Manager', value: 'manager' }, { label: 'HR', value: 'hr' }, { label: 'Final', value: 'final' }] } },
  { type: 'date', name: 'scheduledAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Scheduled At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'integer', name: 'duration', defaultValue: 60, interface: 'number', uiSchema: { type: 'number', title: 'Duration (min)', 'x-component': 'InputNumber' } },
  { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
  { type: 'string', name: 'result', interface: 'select', uiSchema: { type: 'string', title: 'Result', 'x-component': 'Select', enum: [{ label: 'Pass', value: 'pass' }, { label: 'Fail', value: 'fail' }, { label: 'Pending', value: 'pending' }, { label: 'No Show', value: 'no_show' }] } },
  { type: 'integer', name: 'score', interface: 'number', uiSchema: { type: 'number', title: 'Score (1-10)', 'x-component': 'InputNumber', 'x-component-props': { min: 1, max: 10 } } },
  { type: 'text', name: 'feedback', interface: 'textarea', uiSchema: { type: 'string', title: 'Feedback', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'status', defaultValue: 'scheduled', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Scheduled', value: 'scheduled' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Rescheduled', value: 'rescheduled' }] } },
] });

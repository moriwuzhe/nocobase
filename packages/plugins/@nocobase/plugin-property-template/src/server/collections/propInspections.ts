import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'propInspections', title: 'Inspections / Patrols', fields: [
  { type: 'string', name: 'inspectionNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Inspection No', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Security Patrol', value: 'patrol' }, { label: 'Fire Safety', value: 'fire' }, { label: 'Elevator', value: 'elevator' }, { label: 'Cleaning', value: 'cleaning' }, { label: 'Landscaping', value: 'landscaping' }] } },
  { type: 'string', name: 'area', interface: 'input', uiSchema: { type: 'string', title: 'Area', 'x-component': 'Input' } },
  { type: 'date', name: 'inspectionDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'belongsTo', name: 'inspector', target: 'users', foreignKey: 'inspectorId' },
  { type: 'string', name: 'result', interface: 'select', uiSchema: { type: 'string', title: 'Result', 'x-component': 'Select', enum: [{ label: 'Pass', value: 'pass' }, { label: 'Issues Found', value: 'issues' }, { label: 'Fail', value: 'fail' }] } },
  { type: 'text', name: 'findings', interface: 'textarea', uiSchema: { type: 'string', title: 'Findings', 'x-component': 'Input.TextArea' } },
  { type: 'jsonb', name: 'photos', defaultValue: [] },
] });

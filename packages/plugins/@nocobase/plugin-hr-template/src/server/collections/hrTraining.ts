import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'hrTraining', title: 'Training Programs',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Training Title', 'x-component': 'Input' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Onboarding', value: 'onboarding' }, { label: 'Technical', value: 'technical' }, { label: 'Soft Skills', value: 'soft_skills' }, { label: 'Compliance', value: 'compliance' }, { label: 'Safety', value: 'safety' }, { label: 'Leadership', value: 'leadership' }] } },
    { type: 'text', name: 'description', interface: 'richText', uiSchema: { type: 'string', title: 'Description', 'x-component': 'RichText' } },
    { type: 'string', name: 'trainer', interface: 'input', uiSchema: { type: 'string', title: 'Trainer', 'x-component': 'Input' } },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
    { type: 'integer', name: 'maxParticipants', interface: 'number', uiSchema: { type: 'number', title: 'Max Participants', 'x-component': 'InputNumber' } },
    { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
    { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: 'Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'status', defaultValue: 'planned', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Planned', value: 'planned' }, { label: 'In Progress', value: 'in_progress' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'jsonb', name: 'participants', defaultValue: [], comment: 'Employee IDs' },
  ],
});

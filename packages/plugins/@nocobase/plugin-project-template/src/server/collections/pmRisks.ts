import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'pmRisks', title: 'Risks & Issues',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'project', target: 'pmProjects', foreignKey: 'projectId' },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Risk', value: 'risk' }, { label: 'Issue', value: 'issue' }] } },
    { type: 'string', name: 'severity', interface: 'select', uiSchema: { type: 'string', title: 'Severity', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' }] } },
    { type: 'string', name: 'probability', interface: 'select', uiSchema: { type: 'string', title: 'Probability', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }] } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'mitigation', interface: 'textarea', uiSchema: { type: 'string', title: 'Mitigation Plan', 'x-component': 'Input.TextArea' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
    { type: 'string', name: 'status', defaultValue: 'open', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Open', value: 'open' }, { label: 'Mitigating', value: 'mitigating' }, { label: 'Resolved', value: 'resolved' }, { label: 'Accepted', value: 'accepted' }, { label: 'Closed', value: 'closed' }] } },
  ],
});

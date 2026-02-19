import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'crmCompetitors', title: 'Competitors',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Competitor Name', 'x-component': 'Input' } },
    { type: 'string', name: 'website', interface: 'url', uiSchema: { type: 'string', title: 'Website', 'x-component': 'Input.URL' } },
    { type: 'string', name: 'strengths', interface: 'textarea', uiSchema: { type: 'string', title: 'Strengths', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'weaknesses', interface: 'textarea', uiSchema: { type: 'string', title: 'Weaknesses', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'notes', interface: 'richText', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'RichText' } },
  ],
});

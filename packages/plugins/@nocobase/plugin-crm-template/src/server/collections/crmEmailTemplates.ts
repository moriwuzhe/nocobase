import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'crmEmailTemplates', title: 'Email Templates',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Template Name', 'x-component': 'Input' } },
    { type: 'string', name: 'subject', interface: 'input', uiSchema: { type: 'string', title: 'Subject', 'x-component': 'Input' } },
    { type: 'text', name: 'body', interface: 'richText', uiSchema: { type: 'string', title: 'Body', 'x-component': 'RichText' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'Follow-up', value: 'followup' }, { label: 'Introduction', value: 'intro' }, { label: 'Proposal', value: 'proposal' }, { label: 'Thank You', value: 'thankyou' }, { label: 'Reminder', value: 'reminder' }, { label: 'Newsletter', value: 'newsletter' }] } },
    { type: 'boolean', name: 'shared', defaultValue: false },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
  ],
});

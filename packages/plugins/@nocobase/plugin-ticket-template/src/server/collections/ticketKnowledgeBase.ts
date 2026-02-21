import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'ticketKnowledgeBase', title: 'Knowledge Base',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
    { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: 'Content', 'x-component': 'RichText' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'FAQ', value: 'faq' }, { label: 'Guide', value: 'guide' }, { label: 'Troubleshoot', value: 'troubleshoot' }] } },
    { type: 'jsonb', name: 'tags', defaultValue: [] },
    { type: 'integer', name: 'viewCount', defaultValue: 0 },
    { type: 'boolean', name: 'published', defaultValue: true },
    { type: 'belongsTo', name: 'author', target: 'users', foreignKey: 'authorId' },
  ],
});

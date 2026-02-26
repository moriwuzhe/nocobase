import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'oaAnnouncements',
  title: 'Announcements',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
    { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: 'Content', 'x-component': 'RichText' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: 'Category', 'x-component': 'Select', enum: [{ label: 'General', value: 'general' }, { label: 'Policy', value: 'policy' }, { label: 'Event', value: 'event' }, { label: 'HR', value: 'hr' }, { label: 'IT', value: 'it' }] } },
    { type: 'string', name: 'priority', defaultValue: 'normal', interface: 'select', uiSchema: { type: 'string', title: 'Priority', 'x-component': 'Select', enum: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] } },
    { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }] } },
    { type: 'boolean', name: 'pinned', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Pinned', 'x-component': 'Checkbox' } },
    { type: 'date', name: 'publishAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Publish Date', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'date', name: 'expireAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Expire Date', 'x-component': 'DatePicker' } },
    { type: 'belongsTo', name: 'author', target: 'users', foreignKey: 'authorId', interface: 'm2o', uiSchema: { type: 'object', title: 'Author', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'jsonb', name: 'targetDepartments', defaultValue: [], comment: 'Empty means all departments' },
  ],
});

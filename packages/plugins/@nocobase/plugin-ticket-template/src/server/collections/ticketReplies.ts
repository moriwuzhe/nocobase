import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'ticketReplies', title: 'Ticket Replies',
  fields: [
    { type: 'belongsTo', name: 'ticket', target: 'tickets', foreignKey: 'ticketId' },
    { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: 'Reply', 'x-component': 'RichText' } },
    { type: 'belongsTo', name: 'author', target: 'users', foreignKey: 'authorId', interface: 'm2o', uiSchema: { type: 'object', title: 'Author', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'boolean', name: 'internal', defaultValue: false, comment: 'Internal notes not visible to customer' },
    { type: 'jsonb', name: 'attachments', defaultValue: [] },
  ],
});

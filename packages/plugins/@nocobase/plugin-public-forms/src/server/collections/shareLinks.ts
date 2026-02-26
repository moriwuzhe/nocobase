import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'shareLinks',
  title: 'Share Links',
  fields: [
    { type: 'string', name: 'token', unique: true },
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'recordId' },
    { type: 'string', name: 'viewType', defaultValue: 'detail' },
    { type: 'json', name: 'fields', defaultValue: [] },
    { type: 'date', name: 'expiresAt' },
    { type: 'string', name: 'password' },
    { type: 'string', name: 'permission', defaultValue: 'view' },
    { type: 'integer', name: 'createdById' },
    { type: 'integer', name: 'accessCount', defaultValue: 0 },
    { type: 'date', name: 'lastAccessedAt' },
    { type: 'boolean', name: 'enabled', defaultValue: true },
  ],
});

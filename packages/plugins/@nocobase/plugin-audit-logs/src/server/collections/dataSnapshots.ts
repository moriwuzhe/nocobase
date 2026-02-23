import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'dataSnapshots',
  title: 'Data Snapshots',
  createdBy: false,
  updatedBy: false,
  updatedAt: false,
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'recordId' },
    { type: 'bigInt', name: 'version' },
    { type: 'text', name: 'data' },
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId' },
  ],
});

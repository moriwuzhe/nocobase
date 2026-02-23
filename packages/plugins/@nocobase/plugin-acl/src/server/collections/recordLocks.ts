import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'recordLocks',
  title: 'Record Locks',
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'recordId' },
    { type: 'boolean', name: 'locked', defaultValue: true },
    { type: 'integer', name: 'lockedById' },
    { type: 'string', name: 'lockedByName' },
    { type: 'date', name: 'lockedAt' },
    { type: 'string', name: 'reason' },
    { type: 'integer', name: 'unlockedById' },
    { type: 'date', name: 'unlockedAt' },
  ],
});

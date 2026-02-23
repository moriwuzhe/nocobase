import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'associationFilterConfigs',
  title: 'Association Filter Configs',
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'sourceField' },
    { type: 'string', name: 'targetCollection' },
    { type: 'string', name: 'targetField' },
    { type: 'string', name: 'labelField' },
    { type: 'json', name: 'filter', defaultValue: {} },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'sort', defaultValue: 0 },
  ],
});

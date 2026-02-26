import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'conditionalFormats',
  title: 'Conditional Formats',
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'title' },
    { type: 'string', name: 'fieldName' },
    { type: 'string', name: 'operator', defaultValue: 'eq' },
    { type: 'json', name: 'value' },
    { type: 'json', name: 'style', defaultValue: {} },
    { type: 'string', name: 'scope', defaultValue: 'cell' },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'priority', defaultValue: 0 },
  ],
});

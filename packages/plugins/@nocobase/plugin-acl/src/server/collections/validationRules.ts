import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'validationRules',
  title: 'Validation Rules',
  logging: true,
  fields: [
    { type: 'string', name: 'collectionName' },
    { type: 'string', name: 'fieldName' },
    { type: 'string', name: 'ruleType', defaultValue: 'required' },
    { type: 'json', name: 'config', defaultValue: {} },
    { type: 'string', name: 'errorMessage', defaultValue: '验证失败' },
    { type: 'boolean', name: 'enabled', defaultValue: true },
    { type: 'integer', name: 'sort', defaultValue: 0 },
  ],
});

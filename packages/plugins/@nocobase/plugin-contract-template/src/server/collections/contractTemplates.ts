import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'contractTemplates', title: 'Contract Templates', fields: [
  { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Template Name', 'x-component': 'Input' } },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Sales', value: 'sales' }, { label: 'Purchase', value: 'purchase' }, { label: 'Service', value: 'service' }, { label: 'NDA', value: 'nda' }, { label: 'Employment', value: 'employment' }] } },
  { type: 'text', name: 'content', interface: 'richText', uiSchema: { type: 'string', title: 'Template Content', 'x-component': 'RichText' } },
  { type: 'boolean', name: 'active', defaultValue: true },
] });

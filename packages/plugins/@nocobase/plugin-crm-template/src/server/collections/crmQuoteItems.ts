import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'crmQuoteItems', title: 'Quote Line Items',
  fields: [
    { type: 'belongsTo', name: 'quote', target: 'crmQuotes', foreignKey: 'quoteId' },
    { type: 'belongsTo', name: 'product', target: 'crmProducts', foreignKey: 'productId', interface: 'm2o', uiSchema: { type: 'object', title: 'Product', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'integer', name: 'quantity', defaultValue: 1, interface: 'number', uiSchema: { type: 'number', title: 'Qty', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'unitPrice', interface: 'number', uiSchema: { type: 'number', title: 'Unit Price', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'discount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Discount %', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
    { type: 'integer', name: 'sort', defaultValue: 0 },
  ],
});

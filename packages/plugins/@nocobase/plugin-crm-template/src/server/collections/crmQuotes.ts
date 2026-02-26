import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'crmQuotes', title: 'Quotes / Proposals',
  fields: [
    { type: 'string', name: 'quoteNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Quote No', 'x-component': 'Input' } },
    { type: 'string', name: 'title', interface: 'input', uiSchema: { type: 'string', title: 'Title', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'contact', target: 'crmContacts', foreignKey: 'contactId' },
    { type: 'belongsTo', name: 'deal', target: 'crmDeals', foreignKey: 'dealId' },
    { type: 'float', name: 'subtotal', interface: 'number', uiSchema: { type: 'number', title: 'Subtotal', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'discount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Discount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'tax', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Tax', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'totalAmount', interface: 'number', uiSchema: { type: 'number', title: 'Total', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Sent', value: 'sent' }, { label: 'Viewed', value: 'viewed' }, { label: 'Accepted', value: 'accepted' }, { label: 'Rejected', value: 'rejected' }, { label: 'Expired', value: 'expired' }] } },
    { type: 'date', name: 'validUntil', interface: 'datetime', uiSchema: { type: 'string', title: 'Valid Until', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'terms', interface: 'richText', uiSchema: { type: 'string', title: 'Terms & Conditions', 'x-component': 'RichText' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
    { type: 'hasMany', name: 'lineItems', target: 'crmQuoteItems', foreignKey: 'quoteId' },
  ],
});

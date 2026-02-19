import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'crmContracts', title: 'Sales Contracts',
  fields: [
    { type: 'string', name: 'contractNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Contract No', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'customer', target: 'crmCustomers', foreignKey: 'customerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Customer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'deal', target: 'crmDeals', foreignKey: 'dealId' },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Contract Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'date', name: 'signDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Sign Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'status', defaultValue: 'active', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Terminated', value: 'terminated' }, { label: 'Renewed', value: 'renewed' }] } },
    { type: 'boolean', name: 'autoRenew', defaultValue: false },
    { type: 'belongsTo', name: 'owner', target: 'users', foreignKey: 'ownerId' },
    { type: 'hasMany', name: 'payments', target: 'crmPayments', foreignKey: 'contractId' },
    { type: 'text', name: 'terms', interface: 'richText', uiSchema: { type: 'string', title: 'Terms', 'x-component': 'RichText' } },
  ],
});

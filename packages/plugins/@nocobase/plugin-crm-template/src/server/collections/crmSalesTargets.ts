import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'crmSalesTargets', title: 'Sales Targets / Forecasts',
  fields: [
    { type: 'belongsTo', name: 'user', target: 'users', foreignKey: 'userId', interface: 'm2o', uiSchema: { type: 'object', title: 'Sales Rep', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'string', name: 'period', interface: 'input', uiSchema: { type: 'string', title: 'Period (e.g. 2025-Q1)', 'x-component': 'Input' } },
    { type: 'float', name: 'targetAmount', interface: 'number', uiSchema: { type: 'number', title: 'Target Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'achievedAmount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Achieved', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'integer', name: 'targetDeals', interface: 'number', uiSchema: { type: 'number', title: 'Target Deals', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'achievedDeals', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Achieved Deals', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'targetLeads', interface: 'number', uiSchema: { type: 'number', title: 'Target Leads', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'achievedLeads', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Achieved Leads', 'x-component': 'InputNumber' } },
  ],
});

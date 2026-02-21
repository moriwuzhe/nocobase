import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'hrSalary', title: 'Salary Records',
  fields: [
    { type: 'belongsTo', name: 'employee', target: 'hrEmployees', foreignKey: 'employeeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Employee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'period', interface: 'input', uiSchema: { type: 'string', title: 'Period (YYYY-MM)', 'x-component': 'Input' } },
    { type: 'float', name: 'baseSalary', interface: 'number', uiSchema: { type: 'number', title: 'Base Salary', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'bonus', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Bonus', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'overtime', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Overtime Pay', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'allowance', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Allowance', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'socialInsurance', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Social Insurance', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'housingFund', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Housing Fund', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'tax', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Tax', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'deductions', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Other Deductions', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'netPay', interface: 'number', uiSchema: { type: 'number', title: 'Net Pay', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Confirmed', value: 'confirmed' }, { label: 'Paid', value: 'paid' }] } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'hrPerformance', title: 'Performance Reviews',
  fields: [
    { type: 'belongsTo', name: 'employee', target: 'hrEmployees', foreignKey: 'employeeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Employee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'reviewer', target: 'users', foreignKey: 'reviewerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Reviewer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'string', name: 'period', interface: 'input', uiSchema: { type: 'string', title: 'Review Period', 'x-component': 'Input' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Monthly', value: 'monthly' }, { label: 'Quarterly', value: 'quarterly' }, { label: 'Semi-annual', value: 'semiannual' }, { label: 'Annual', value: 'annual' }, { label: 'Probation', value: 'probation' }] } },
    { type: 'integer', name: 'overallScore', interface: 'number', uiSchema: { type: 'number', title: 'Overall Score (1-100)', 'x-component': 'InputNumber', 'x-component-props': { min: 0, max: 100 } } },
    { type: 'string', name: 'rating', interface: 'select', uiSchema: { type: 'string', title: 'Rating', 'x-component': 'Select', enum: [{ label: 'Exceptional', value: 'exceptional' }, { label: 'Exceeds Expectations', value: 'exceeds' }, { label: 'Meets Expectations', value: 'meets' }, { label: 'Needs Improvement', value: 'needs_improvement' }, { label: 'Unsatisfactory', value: 'unsatisfactory' }] } },
    { type: 'text', name: 'strengths', interface: 'textarea', uiSchema: { type: 'string', title: 'Strengths', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'areasForImprovement', interface: 'textarea', uiSchema: { type: 'string', title: 'Areas for Improvement', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'goals', interface: 'textarea', uiSchema: { type: 'string', title: 'Goals for Next Period', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'employeeComment', interface: 'textarea', uiSchema: { type: 'string', title: 'Employee Comment', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'draft', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' }, { label: 'Acknowledged', value: 'acknowledged' }, { label: 'Completed', value: 'completed' }] } },
  ],
});

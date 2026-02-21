import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'hrLeaveRequests',
  title: 'Leave Requests',
  fields: [
    { type: 'belongsTo', name: 'employee', target: 'hrEmployees', foreignKey: 'employeeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Employee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Leave Type', 'x-component': 'Select', enum: [{ label: 'Annual Leave', value: 'annual' }, { label: 'Sick Leave', value: 'sick' }, { label: 'Personal Leave', value: 'personal' }, { label: 'Maternity Leave', value: 'maternity' }, { label: 'Marriage Leave', value: 'marriage' }, { label: 'Bereavement Leave', value: 'bereavement' }, { label: 'Other', value: 'other' }] } },
    { type: 'date', name: 'startDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'endDate', interface: 'datetime', uiSchema: { type: 'string', title: 'End Date', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'days', interface: 'number', uiSchema: { type: 'number', title: 'Days', 'x-component': 'InputNumber', 'x-component-props': { precision: 1 } } },
    { type: 'text', name: 'reason', interface: 'textarea', uiSchema: { type: 'string', title: 'Reason', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Cancelled', value: 'cancelled' }] } },
    { type: 'belongsTo', name: 'approver', target: 'users', foreignKey: 'approverId', interface: 'm2o', uiSchema: { type: 'object', title: 'Approver', 'x-component': 'AssociationField' } },
    { type: 'text', name: 'approverComment', interface: 'textarea', uiSchema: { type: 'string', title: 'Approver Comment', 'x-component': 'Input.TextArea' } },
  ],
});

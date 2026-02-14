import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'hrEmployees',
  title: 'Employees',
  fields: [
    { type: 'string', name: 'employeeId', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Employee ID', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Full Name', 'x-component': 'Input' } },
    { type: 'string', name: 'email', interface: 'email', uiSchema: { type: 'string', title: 'Email', 'x-component': 'Input' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
    { type: 'string', name: 'gender', interface: 'select', uiSchema: { type: 'string', title: 'Gender', 'x-component': 'Select', enum: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] } },
    { type: 'date', name: 'birthDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Birth Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'hireDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Hire Date', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'position', interface: 'input', uiSchema: { type: 'string', title: 'Position', 'x-component': 'Input' } },
    { type: 'string', name: 'level', interface: 'select', uiSchema: { type: 'string', title: 'Level', 'x-component': 'Select', enum: [{ label: 'Junior', value: 'junior' }, { label: 'Mid', value: 'mid' }, { label: 'Senior', value: 'senior' }, { label: 'Lead', value: 'lead' }, { label: 'Manager', value: 'manager' }, { label: 'Director', value: 'director' }] } },
    { type: 'string', name: 'status', defaultValue: 'active', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Active', value: 'active' }, { label: 'On Leave', value: 'on_leave' }, { label: 'Resigned', value: 'resigned' }, { label: 'Terminated', value: 'terminated' }] } },
    { type: 'string', name: 'department', interface: 'input', uiSchema: { type: 'string', title: 'Department', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'manager', target: 'hrEmployees', foreignKey: 'managerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Manager', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: 'Address', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'idNumber', interface: 'input', uiSchema: { type: 'string', title: 'ID Number', 'x-component': 'Input' } },
    { type: 'string', name: 'bankAccount', interface: 'input', uiSchema: { type: 'string', title: 'Bank Account', 'x-component': 'Input' } },
    { type: 'string', name: 'emergencyContact', interface: 'input', uiSchema: { type: 'string', title: 'Emergency Contact', 'x-component': 'Input' } },
    { type: 'string', name: 'emergencyPhone', interface: 'phone', uiSchema: { type: 'string', title: 'Emergency Phone', 'x-component': 'Input' } },
  ],
});

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'hrAttendance',
  title: 'Attendance',
  fields: [
    { type: 'belongsTo', name: 'employee', target: 'hrEmployees', foreignKey: 'employeeId', interface: 'm2o', uiSchema: { type: 'object', title: 'Employee', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'date', name: 'date', interface: 'datetime', uiSchema: { type: 'string', title: 'Date', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'checkIn', interface: 'datetime', uiSchema: { type: 'string', title: 'Check In', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'date', name: 'checkOut', interface: 'datetime', uiSchema: { type: 'string', title: 'Check Out', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'float', name: 'workHours', interface: 'number', uiSchema: { type: 'number', title: 'Work Hours', 'x-component': 'InputNumber', 'x-component-props': { precision: 1 } } },
    { type: 'string', name: 'status', defaultValue: 'normal', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Normal', value: 'normal' }, { label: 'Late', value: 'late' }, { label: 'Early Leave', value: 'early_leave' }, { label: 'Absent', value: 'absent' }, { label: 'On Leave', value: 'on_leave' }] } },
    { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location', 'x-component': 'Input' } },
    { type: 'text', name: 'remark', interface: 'textarea', uiSchema: { type: 'string', title: 'Remark', 'x-component': 'Input.TextArea' } },
  ],
});

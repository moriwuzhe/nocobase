import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'eduStudents', title: 'Students',
  fields: [
    { type: 'string', name: 'studentId', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Student ID', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Name', 'x-component': 'Input' } },
    { type: 'string', name: 'gender', interface: 'select', uiSchema: { type: 'string', title: 'Gender', 'x-component': 'Select', enum: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] } },
    { type: 'date', name: 'birthDate', interface: 'datetime', uiSchema: { type: 'string', title: 'Birth Date', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'grade', interface: 'input', uiSchema: { type: 'string', title: 'Grade', 'x-component': 'Input' } },
    { type: 'string', name: 'className', interface: 'input', uiSchema: { type: 'string', title: 'Class', 'x-component': 'Input' } },
    { type: 'string', name: 'parentName', interface: 'input', uiSchema: { type: 'string', title: 'Parent Name', 'x-component': 'Input' } },
    { type: 'string', name: 'parentPhone', interface: 'phone', uiSchema: { type: 'string', title: 'Parent Phone', 'x-component': 'Input' } },
    { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: 'Address', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'enrolled', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Enrolled', value: 'enrolled' }, { label: 'Graduated', value: 'graduated' }, { label: 'Transferred', value: 'transferred' }, { label: 'Dropped', value: 'dropped' }] } },
  ],
});

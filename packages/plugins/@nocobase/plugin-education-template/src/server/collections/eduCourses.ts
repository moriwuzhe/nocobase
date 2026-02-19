import { defineCollection } from '@nocobase/database';
export default defineCollection({
  name: 'eduCourses', title: 'Courses',
  fields: [
    { type: 'string', name: 'courseCode', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Course Code', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Course Name', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'teacher', target: 'users', foreignKey: 'teacherId', interface: 'm2o', uiSchema: { type: 'object', title: 'Teacher', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'integer', name: 'credits', interface: 'number', uiSchema: { type: 'number', title: 'Credits', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'maxStudents', interface: 'number', uiSchema: { type: 'number', title: 'Max Students', 'x-component': 'InputNumber' } },
    { type: 'string', name: 'schedule', interface: 'input', uiSchema: { type: 'string', title: 'Schedule', 'x-component': 'Input' } },
    { type: 'string', name: 'semester', interface: 'input', uiSchema: { type: 'string', title: 'Semester', 'x-component': 'Input' } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true,
  name: 'eduGrades', title: 'Grades',
  fields: [
    { type: 'belongsTo', name: 'student', target: 'eduStudents', foreignKey: 'studentId', interface: 'm2o', uiSchema: { type: 'object', title: 'Student', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'belongsTo', name: 'course', target: 'eduCourses', foreignKey: 'courseId', interface: 'm2o', uiSchema: { type: 'object', title: 'Course', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'float', name: 'score', interface: 'number', uiSchema: { type: 'number', title: 'Score', 'x-component': 'InputNumber', 'x-component-props': { precision: 1, min: 0, max: 100 } } },
    { type: 'string', name: 'grade', interface: 'select', uiSchema: { type: 'string', title: 'Grade', 'x-component': 'Select', enum: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }, { label: 'D', value: 'D' }, { label: 'F', value: 'F' }] } },
    { type: 'string', name: 'semester', interface: 'input', uiSchema: { type: 'string', title: 'Semester', 'x-component': 'Input' } },
    { type: 'text', name: 'comment', interface: 'textarea', uiSchema: { type: 'string', title: 'Teacher Comment', 'x-component': 'Input.TextArea' } },
  ],
});

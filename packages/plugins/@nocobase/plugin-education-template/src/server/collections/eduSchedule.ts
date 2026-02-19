import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'eduSchedule', title: 'Class Schedule', fields: [
  { type: 'belongsTo', name: 'course', target: 'eduCourses', foreignKey: 'courseId' },
  { type: 'string', name: 'dayOfWeek', interface: 'select', uiSchema: { type: 'string', title: 'Day', 'x-component': 'Select', enum: [{ label: 'Monday', value: 'mon' }, { label: 'Tuesday', value: 'tue' }, { label: 'Wednesday', value: 'wed' }, { label: 'Thursday', value: 'thu' }, { label: 'Friday', value: 'fri' }, { label: 'Saturday', value: 'sat' }, { label: 'Sunday', value: 'sun' }] } },
  { type: 'string', name: 'startTime', interface: 'input', uiSchema: { type: 'string', title: 'Start Time', 'x-component': 'Input' } },
  { type: 'string', name: 'endTime', interface: 'input', uiSchema: { type: 'string', title: 'End Time', 'x-component': 'Input' } },
  { type: 'string', name: 'classroom', interface: 'input', uiSchema: { type: 'string', title: 'Classroom', 'x-component': 'Input' } },
  { type: 'belongsTo', name: 'teacher', target: 'users', foreignKey: 'teacherId' },
] });

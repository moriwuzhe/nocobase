import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'oaMeetingBookings',
  title: 'Meeting Bookings',
  fields: [
    { type: 'string', name: 'subject', interface: 'input', uiSchema: { type: 'string', title: 'Subject', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'room', target: 'oaMeetingRooms', foreignKey: 'roomId', interface: 'm2o', uiSchema: { type: 'object', title: 'Meeting Room', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'date', name: 'startTime', interface: 'datetime', uiSchema: { type: 'string', title: 'Start Time', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'date', name: 'endTime', interface: 'datetime', uiSchema: { type: 'string', title: 'End Time', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
    { type: 'belongsTo', name: 'organizer', target: 'users', foreignKey: 'organizerId', interface: 'm2o', uiSchema: { type: 'object', title: 'Organizer', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'nickname', value: 'id' } } } },
    { type: 'jsonb', name: 'attendees', defaultValue: [], comment: 'User IDs of attendees' },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'confirmed', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Confirmed', value: 'confirmed' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Completed', value: 'completed' }] } },
    { type: 'boolean', name: 'recurring', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Recurring', 'x-component': 'Checkbox' } },
  ],
});

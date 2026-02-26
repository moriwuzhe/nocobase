import { defineCollection } from '@nocobase/database';

export default defineCollection({
  sortable: true,
  logging: true,
  name: 'oaMeetingRooms',
  title: 'Meeting Rooms',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: 'Room Name', 'x-component': 'Input' } },
    { type: 'string', name: 'location', interface: 'input', uiSchema: { type: 'string', title: 'Location / Floor', 'x-component': 'Input' } },
    { type: 'integer', name: 'capacity', interface: 'number', uiSchema: { type: 'number', title: 'Capacity', 'x-component': 'InputNumber' } },
    { type: 'jsonb', name: 'equipment', defaultValue: [], comment: 'projector, whiteboard, video-conf, etc.' },
    { type: 'boolean', name: 'available', defaultValue: true, interface: 'checkbox', uiSchema: { type: 'boolean', title: 'Available', 'x-component': 'Checkbox' } },
    { type: 'hasMany', name: 'bookings', target: 'oaMeetingBookings', foreignKey: 'roomId' },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'restTables', title: '{{t("Tables")}}',
  fields: [
    { type: 'string', name: 'tableNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '{{t("Table No")}}', 'x-component': 'Input' } },
    { type: 'integer', name: 'capacity', interface: 'number', uiSchema: { type: 'number', title: '{{t("Capacity")}}', 'x-component': 'InputNumber' } },
    { type: 'string', name: 'area', interface: 'select', uiSchema: { type: 'string', title: '{{t("Area")}}', 'x-component': 'Select', enum: [{ label: '大厅', value: 'hall' }, { label: '包间', value: 'private' }, { label: '露台', value: 'terrace' }] } },
    { type: 'string', name: 'status', defaultValue: 'available', interface: 'select', uiSchema: { type: 'string', title: '{{t("Status")}}', 'x-component': 'Select', enum: [{ label: '空闲', value: 'available' }, { label: '用餐中', value: 'occupied' }, { label: '已预订', value: 'reserved' }, { label: '清洁中', value: 'cleaning' }] } },
  ],
});

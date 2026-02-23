import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'logDrivers', title: '{{t("Drivers")}}',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: '姓名', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: '电话', 'x-component': 'Input' } },
    { type: 'string', name: 'licenseNo', interface: 'input', uiSchema: { type: 'string', title: '驾照号', 'x-component': 'Input' } },
    { type: 'string', name: 'vehiclePlate', interface: 'input', uiSchema: { type: 'string', title: '车牌号', 'x-component': 'Input' } },
    { type: 'string', name: 'vehicleType', interface: 'select', uiSchema: { type: 'string', title: '车型', 'x-component': 'Select', enum: [{ label: '小型货车', value: 'van' }, { label: '中型货车', value: 'truck_m' }, { label: '大型货车', value: 'truck_l' }, { label: '冷藏车', value: 'refrigerated' }] } },
    { type: 'string', name: 'status', defaultValue: 'available', interface: 'select', uiSchema: { type: 'string', title: '状态', 'x-component': 'Select', enum: [{ label: '空闲', value: 'available' }, { label: '运输中', value: 'on_route' }, { label: '休息', value: 'off_duty' }] } },
  ],
});

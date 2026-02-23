import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'logShipments', title: '{{t("Shipments")}}',
  fields: [
    { type: 'string', name: 'trackingNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '运单号', 'x-component': 'Input' } },
    { type: 'string', name: 'sender', interface: 'input', uiSchema: { type: 'string', title: '发货人', 'x-component': 'Input' } },
    { type: 'string', name: 'senderAddress', interface: 'textarea', uiSchema: { type: 'string', title: '发货地址', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'receiver', interface: 'input', uiSchema: { type: 'string', title: '收货人', 'x-component': 'Input' } },
    { type: 'string', name: 'receiverAddress', interface: 'textarea', uiSchema: { type: 'string', title: '收货地址', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'receiverPhone', interface: 'phone', uiSchema: { type: 'string', title: '收货电话', 'x-component': 'Input' } },
    { type: 'float', name: 'weight', interface: 'number', uiSchema: { type: 'number', title: '重量(kg)', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'float', name: 'freight', interface: 'number', uiSchema: { type: 'number', title: '运费', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: '状态', 'x-component': 'Select', enum: [{ label: '待发货', value: 'pending' }, { label: '运输中', value: 'in_transit' }, { label: '派送中', value: 'delivering' }, { label: '已签收', value: 'delivered' }, { label: '已退回', value: 'returned' }] } },
    { type: 'string', name: 'driver', interface: 'input', uiSchema: { type: 'string', title: '司机', 'x-component': 'Input' } },
    { type: 'string', name: 'vehiclePlate', interface: 'input', uiSchema: { type: 'string', title: '车牌号', 'x-component': 'Input' } },
    { type: 'date', name: 'shipDate', interface: 'datetime', uiSchema: { type: 'string', title: '发货日期', 'x-component': 'DatePicker' } },
    { type: 'date', name: 'deliveryDate', interface: 'datetime', uiSchema: { type: 'string', title: '签收日期', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'remark', interface: 'textarea', uiSchema: { type: 'string', title: '备注', 'x-component': 'Input.TextArea' } },
  ],
});

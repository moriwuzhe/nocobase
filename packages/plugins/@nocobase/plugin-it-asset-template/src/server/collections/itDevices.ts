import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'itDevices', title: '{{t("IT Devices")}}',
  fields: [
    { type: 'string', name: 'assetTag', unique: true, interface: 'input', uiSchema: { type: 'string', title: '资产编号', 'x-component': 'Input' } },
    { type: 'string', name: 'deviceName', interface: 'input', uiSchema: { type: 'string', title: '设备名称', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: '分类', 'x-component': 'Select', enum: [{ label: '笔记本电脑', value: 'laptop' }, { label: '台式机', value: 'desktop' }, { label: '显示器', value: 'monitor' }, { label: '打印机', value: 'printer' }, { label: '服务器', value: 'server' }, { label: '网络设备', value: 'network' }, { label: '手机/平板', value: 'mobile' }, { label: '其他', value: 'other' }] } },
    { type: 'string', name: 'brand', interface: 'input', uiSchema: { type: 'string', title: '品牌', 'x-component': 'Input' } },
    { type: 'string', name: 'model', interface: 'input', uiSchema: { type: 'string', title: '型号', 'x-component': 'Input' } },
    { type: 'string', name: 'serialNumber', interface: 'input', uiSchema: { type: 'string', title: '序列号', 'x-component': 'Input' } },
    { type: 'string', name: 'status', defaultValue: 'in_stock', interface: 'select', uiSchema: { type: 'string', title: '状态', 'x-component': 'Select', enum: [{ label: '库存', value: 'in_stock' }, { label: '使用中', value: 'in_use' }, { label: '维修中', value: 'repairing' }, { label: '已报废', value: 'scrapped' }] } },
    { type: 'string', name: 'assignedTo', interface: 'input', uiSchema: { type: 'string', title: '使用人', 'x-component': 'Input' } },
    { type: 'string', name: 'department', interface: 'input', uiSchema: { type: 'string', title: '部门', 'x-component': 'Input' } },
    { type: 'date', name: 'purchaseDate', interface: 'datetime', uiSchema: { type: 'string', title: '购入日期', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'purchasePrice', interface: 'number', uiSchema: { type: 'number', title: '购入价格', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'date', name: 'warrantyExpiry', interface: 'datetime', uiSchema: { type: 'string', title: '保修到期', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: '备注', 'x-component': 'Input.TextArea' } },
  ],
});

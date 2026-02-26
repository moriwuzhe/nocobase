import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'itLicenses', title: '{{t("Software Licenses")}}',
  fields: [
    { type: 'string', name: 'softwareName', interface: 'input', uiSchema: { type: 'string', title: '软件名称', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'licenseKey', interface: 'input', uiSchema: { type: 'string', title: '许可证密钥', 'x-component': 'Input' } },
    { type: 'string', name: 'licenseType', interface: 'select', uiSchema: { type: 'string', title: '类型', 'x-component': 'Select', enum: [{ label: '永久', value: 'perpetual' }, { label: '年度订阅', value: 'annual' }, { label: '月度订阅', value: 'monthly' }, { label: '开源', value: 'opensource' }] } },
    { type: 'integer', name: 'seats', interface: 'number', uiSchema: { type: 'number', title: '授权数量', 'x-component': 'InputNumber' } },
    { type: 'integer', name: 'usedSeats', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: '已使用', 'x-component': 'InputNumber' } },
    { type: 'date', name: 'expiryDate', interface: 'datetime', uiSchema: { type: 'string', title: '到期日期', 'x-component': 'DatePicker' } },
    { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: '费用', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'vendor', interface: 'input', uiSchema: { type: 'string', title: '供应商', 'x-component': 'Input' } },
  ],
});

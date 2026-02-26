import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'restOrders', title: '{{t("Orders")}}',
  fields: [
    { type: 'string', name: 'orderNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '{{t("Order No")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'tableNo', interface: 'input', uiSchema: { type: 'string', title: '{{t("Table No")}}', 'x-component': 'Input' } },
    { type: 'integer', name: 'guestCount', interface: 'number', uiSchema: { type: 'number', title: '{{t("Guests")}}', 'x-component': 'InputNumber' } },
    { type: 'float', name: 'totalAmount', interface: 'number', uiSchema: { type: 'number', title: '{{t("Total")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: '{{t("Status")}}', 'x-component': 'Select', enum: [{ label: '待确认', value: 'pending' }, { label: '制作中', value: 'preparing' }, { label: '已上菜', value: 'served' }, { label: '已结账', value: 'paid' }, { label: '已取消', value: 'cancelled' }] } },
    { type: 'string', name: 'paymentMethod', interface: 'select', uiSchema: { type: 'string', title: '{{t("Payment")}}', 'x-component': 'Select', enum: [{ label: '微信', value: 'wechat' }, { label: '支付宝', value: 'alipay' }, { label: '现金', value: 'cash' }, { label: '银行卡', value: 'card' }] } },
    { type: 'string', name: 'waiter', interface: 'input', uiSchema: { type: 'string', title: '{{t("Waiter")}}', 'x-component': 'Input' } },
    { type: 'text', name: 'remark', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Remark")}}', 'x-component': 'Input.TextArea' } },
  ],
});

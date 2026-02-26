import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true,
  logging: true, name: 'ecOrders', title: 'Orders', fields: [
  { type: 'string', name: 'orderNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Order No', 'x-component': 'Input' } },
  { type: 'string', name: 'customerName', interface: 'input', uiSchema: { type: 'string', title: 'Customer', 'x-component': 'Input' } },
  { type: 'string', name: 'customerPhone', interface: 'phone', uiSchema: { type: 'string', title: 'Phone', 'x-component': 'Input' } },
  { type: 'float', name: 'totalAmount', interface: 'number', uiSchema: { type: 'number', title: 'Total Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'discount', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Discount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'shippingFee', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Shipping Fee', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending Payment', value: 'pending' }, { label: 'Paid', value: 'paid' }, { label: 'Shipped', value: 'shipped' }, { label: 'Delivered', value: 'delivered' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Refunded', value: 'refunded' }] } },
  { type: 'string', name: 'paymentMethod', interface: 'select', uiSchema: { type: 'string', title: 'Payment', 'x-component': 'Select', enum: [{ label: 'WeChat Pay', value: 'wechat' }, { label: 'Alipay', value: 'alipay' }, { label: 'Credit Card', value: 'credit_card' }, { label: 'Bank Transfer', value: 'bank' }, { label: 'COD', value: 'cod' }] } },
  { type: 'text', name: 'shippingAddress', interface: 'textarea', uiSchema: { type: 'string', title: 'Shipping Address', 'x-component': 'Input.TextArea' } },
  { type: 'string', name: 'trackingNo', interface: 'input', uiSchema: { type: 'string', title: 'Tracking No', 'x-component': 'Input' } },
  { type: 'date', name: 'paidAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Paid At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'date', name: 'shippedAt', interface: 'datetime', uiSchema: { type: 'string', title: 'Shipped At', 'x-component': 'DatePicker', 'x-component-props': { showTime: true } } },
  { type: 'text', name: 'buyerNote', interface: 'textarea', uiSchema: { type: 'string', title: 'Buyer Note', 'x-component': 'Input.TextArea' } },
  { type: 'text', name: 'sellerNote', interface: 'textarea', uiSchema: { type: 'string', title: 'Seller Note', 'x-component': 'Input.TextArea' } },
] });

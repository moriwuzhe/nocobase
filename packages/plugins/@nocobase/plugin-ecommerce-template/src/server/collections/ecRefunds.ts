import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'ecRefunds', title: 'Refunds',
  fields: [
    { type: 'string', name: 'refundNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: 'Refund No', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'order', target: 'ecOrders', foreignKey: 'orderId', interface: 'm2o', uiSchema: { type: 'object', title: 'Order', 'x-component': 'AssociationField' } },
    { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Refund Only', value: 'refund_only' }, { label: 'Return & Refund', value: 'return_refund' }, { label: 'Exchange', value: 'exchange' }] } },
    { type: 'string', name: 'reason', interface: 'select', uiSchema: { type: 'string', title: 'Reason', 'x-component': 'Select', enum: [{ label: 'Defective', value: 'defective' }, { label: 'Wrong Item', value: 'wrong_item' }, { label: 'Not as Described', value: 'not_described' }, { label: 'Changed Mind', value: 'changed_mind' }, { label: 'Late Delivery', value: 'late' }, { label: 'Other', value: 'other' }] } },
    { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Refund Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: 'Status', 'x-component': 'Select', enum: [{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Refunded', value: 'refunded' }, { label: 'Completed', value: 'completed' }] } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: 'Description', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'adminNote', interface: 'textarea', uiSchema: { type: 'string', title: 'Admin Note', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'trackingNo', interface: 'input', uiSchema: { type: 'string', title: 'Return Tracking', 'x-component': 'Input' } },
  ],
});

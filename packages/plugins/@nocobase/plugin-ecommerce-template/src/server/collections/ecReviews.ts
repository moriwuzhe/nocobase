import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'ecReviews', title: 'Product Reviews',
  fields: [
    { type: 'belongsTo', name: 'product', target: 'ecProducts', foreignKey: 'productId' },
    { type: 'belongsTo', name: 'order', target: 'ecOrders', foreignKey: 'orderId' },
    { type: 'string', name: 'customerName', interface: 'input', uiSchema: { type: 'string', title: 'Customer', 'x-component': 'Input' } },
    { type: 'integer', name: 'rating', interface: 'number', uiSchema: { type: 'number', title: 'Rating (1-5)', 'x-component': 'InputNumber', 'x-component-props': { min: 1, max: 5 } } },
    { type: 'text', name: 'content', interface: 'textarea', uiSchema: { type: 'string', title: 'Review', 'x-component': 'Input.TextArea' } },
    { type: 'jsonb', name: 'images', defaultValue: [] },
    { type: 'boolean', name: 'approved', defaultValue: false },
    { type: 'text', name: 'reply', interface: 'textarea', uiSchema: { type: 'string', title: 'Seller Reply', 'x-component': 'Input.TextArea' } },
  ],
});

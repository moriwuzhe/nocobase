import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true, name: 'restMenuItems', title: '{{t("Menu Items")}}',
  fields: [
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: '{{t("Dish Name")}}', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'category', interface: 'select', uiSchema: { type: 'string', title: '{{t("Category")}}', 'x-component': 'Select', enum: [{ label: '热菜', value: 'hot' }, { label: '凉菜', value: 'cold' }, { label: '汤品', value: 'soup' }, { label: '主食', value: 'staple' }, { label: '饮品', value: 'beverage' }, { label: '甜品', value: 'dessert' }] } },
    { type: 'float', name: 'price', interface: 'number', uiSchema: { type: 'number', title: '{{t("Price")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'float', name: 'cost', interface: 'number', uiSchema: { type: 'number', title: '{{t("Cost")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
    { type: 'string', name: 'status', defaultValue: 'available', interface: 'select', uiSchema: { type: 'string', title: '{{t("Status")}}', 'x-component': 'Select', enum: [{ label: '在售', value: 'available' }, { label: '沽清', value: 'soldout' }, { label: '下架', value: 'disabled' }] } },
    { type: 'text', name: 'description', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Description")}}', 'x-component': 'Input.TextArea' } },
    { type: 'boolean', name: 'isSpicy', defaultValue: false, interface: 'checkbox', uiSchema: { type: 'boolean', title: '{{t("Spicy")}}', 'x-component': 'Checkbox' } },
    { type: 'integer', name: 'preparationTime', interface: 'number', uiSchema: { type: 'number', title: '{{t("Prep Time (min)")}}', 'x-component': 'InputNumber' } },
  ],
});

import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'memberTransactions', title: 'Member Transactions', fields: [
  { type: 'belongsTo', name: 'member', target: 'members', foreignKey: 'memberId' },
  { type: 'string', name: 'type', interface: 'select', uiSchema: { type: 'string', title: 'Type', 'x-component': 'Select', enum: [{ label: 'Top-up', value: 'topup' }, { label: 'Spend', value: 'spend' }, { label: 'Points Earn', value: 'points_earn' }, { label: 'Points Redeem', value: 'points_redeem' }, { label: 'Refund', value: 'refund' }, { label: 'Upgrade', value: 'upgrade' }] } },
  { type: 'float', name: 'amount', interface: 'number', uiSchema: { type: 'number', title: 'Amount', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'integer', name: 'points', defaultValue: 0, interface: 'number', uiSchema: { type: 'number', title: 'Points', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'balanceAfter', interface: 'number', uiSchema: { type: 'number', title: 'Balance After', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'string', name: 'reference', interface: 'input', uiSchema: { type: 'string', title: 'Reference', 'x-component': 'Input' } },
  { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: 'Notes', 'x-component': 'Input.TextArea' } },
  { type: 'belongsTo', name: 'operator', target: 'users', foreignKey: 'operatorId' },
] });

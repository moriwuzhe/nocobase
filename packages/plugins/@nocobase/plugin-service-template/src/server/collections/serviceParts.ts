import { defineCollection } from '@nocobase/database';
export default defineCollection({ name: 'serviceParts', title: 'Service Parts Used', fields: [
  { type: 'belongsTo', name: 'serviceRequest', target: 'serviceRequests', foreignKey: 'serviceRequestId' },
  { type: 'string', name: 'partName', interface: 'input', uiSchema: { type: 'string', title: 'Part', 'x-component': 'Input' } },
  { type: 'integer', name: 'quantity', defaultValue: 1, interface: 'number', uiSchema: { type: 'number', title: 'Qty', 'x-component': 'InputNumber' } },
  { type: 'float', name: 'unitCost', interface: 'number', uiSchema: { type: 'number', title: 'Unit Cost', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  { type: 'float', name: 'totalCost', interface: 'number', uiSchema: { type: 'number', title: 'Total', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
] });

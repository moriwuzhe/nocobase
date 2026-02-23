import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true,
  name: 'clinicPrescriptions', title: '{{t("Prescriptions")}}',
  fields: [
    { type: 'string', name: 'prescriptionNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '{{t("Prescription No")}}', 'x-component': 'Input' } },
    { type: 'belongsTo', name: 'patient', target: 'clinicPatients', foreignKey: 'patientId', interface: 'm2o', uiSchema: { type: 'object', title: '{{t("Patient")}}', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'string', name: 'doctor', interface: 'input', uiSchema: { type: 'string', title: '{{t("Doctor")}}', 'x-component': 'Input' } },
    { type: 'date', name: 'prescriptionDate', interface: 'datetime', uiSchema: { type: 'string', title: '{{t("Date")}}', 'x-component': 'DatePicker' } },
    { type: 'text', name: 'medications', interface: 'richText', uiSchema: { type: 'string', title: '{{t("Medications")}}', 'x-component': 'RichText' } },
    { type: 'text', name: 'dosageInstructions', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Dosage Instructions")}}', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'status', defaultValue: 'pending', interface: 'select', uiSchema: { type: 'string', title: '{{t("Status")}}', 'x-component': 'Select', enum: [{ label: '待取药', value: 'pending' }, { label: '已取药', value: 'dispensed' }, { label: '已完成', value: 'completed' }] } },
    { type: 'float', name: 'totalCost', interface: 'number', uiSchema: { type: 'number', title: '{{t("Total Cost")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2 } } },
  ],
});

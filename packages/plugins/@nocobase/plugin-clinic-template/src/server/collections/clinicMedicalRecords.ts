import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true,
  name: 'clinicMedicalRecords', title: '{{t("Medical Records")}}',
  fields: [
    { type: 'belongsTo', name: 'patient', target: 'clinicPatients', foreignKey: 'patientId', interface: 'm2o', uiSchema: { type: 'object', title: '{{t("Patient")}}', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'date', name: 'visitDate', interface: 'datetime', uiSchema: { type: 'string', title: '{{t("Visit Date")}}', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'doctor', interface: 'input', uiSchema: { type: 'string', title: '{{t("Doctor")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'department', interface: 'input', uiSchema: { type: 'string', title: '{{t("Department")}}', 'x-component': 'Input' } },
    { type: 'text', name: 'chiefComplaint', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Chief Complaint")}}', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'diagnosis', interface: 'richText', uiSchema: { type: 'string', title: '{{t("Diagnosis")}}', 'x-component': 'RichText' } },
    { type: 'text', name: 'treatment', interface: 'richText', uiSchema: { type: 'string', title: '{{t("Treatment Plan")}}', 'x-component': 'RichText' } },
    { type: 'text', name: 'prescription', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Prescription")}}', 'x-component': 'Input.TextArea' } },
    { type: 'float', name: 'fee', interface: 'number', uiSchema: { type: 'number', title: '{{t("Fee")}}', 'x-component': 'InputNumber', 'x-component-props': { precision: 2, addonBefore: '¥' } } },
    { type: 'string', name: 'paymentStatus', defaultValue: 'unpaid', interface: 'select', uiSchema: { type: 'string', title: '{{t("Payment")}}', 'x-component': 'Select', enum: [{ label: '未支付', value: 'unpaid' }, { label: '已支付', value: 'paid' }, { label: '医保', value: 'insurance' }] } },
    { type: 'date', name: 'followUpDate', interface: 'datetime', uiSchema: { type: 'string', title: '{{t("Follow-up Date")}}', 'x-component': 'DatePicker' } },
  ],
});

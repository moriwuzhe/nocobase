import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true,
  name: 'clinicPatients', title: '{{t("Patients")}}',
  fields: [
    { type: 'string', name: 'patientNo', unique: true, interface: 'input', uiSchema: { type: 'string', title: '{{t("Patient No")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'name', interface: 'input', uiSchema: { type: 'string', title: '{{t("Name")}}', 'x-component': 'Input', 'x-validator': 'required' } },
    { type: 'string', name: 'gender', interface: 'select', uiSchema: { type: 'string', title: '{{t("Gender")}}', 'x-component': 'Select', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] } },
    { type: 'date', name: 'birthDate', interface: 'datetime', uiSchema: { type: 'string', title: '{{t("Birth Date")}}', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'phone', interface: 'phone', uiSchema: { type: 'string', title: '{{t("Phone")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'idNumber', interface: 'input', uiSchema: { type: 'string', title: '{{t("ID Number")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'bloodType', interface: 'select', uiSchema: { type: 'string', title: '{{t("Blood Type")}}', 'x-component': 'Select', enum: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'AB', value: 'AB' }, { label: 'O', value: 'O' }] } },
    { type: 'text', name: 'allergies', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Allergies")}}', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'medicalHistory', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Medical History")}}', 'x-component': 'Input.TextArea' } },
    { type: 'string', name: 'emergencyContact', interface: 'input', uiSchema: { type: 'string', title: '{{t("Emergency Contact")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'emergencyPhone', interface: 'phone', uiSchema: { type: 'string', title: '{{t("Emergency Phone")}}', 'x-component': 'Input' } },
    { type: 'text', name: 'address', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Address")}}', 'x-component': 'Input.TextArea' } },
    { type: 'hasMany', name: 'appointments', target: 'clinicAppointments', foreignKey: 'patientId' },
    { type: 'hasMany', name: 'records', target: 'clinicMedicalRecords', foreignKey: 'patientId' },
  ],
});

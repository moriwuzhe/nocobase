import { defineCollection } from '@nocobase/database';
export default defineCollection({
  sortable: true, logging: true,
  name: 'clinicAppointments', title: '{{t("Appointments")}}',
  fields: [
    { type: 'belongsTo', name: 'patient', target: 'clinicPatients', foreignKey: 'patientId', interface: 'm2o', uiSchema: { type: 'object', title: '{{t("Patient")}}', 'x-component': 'AssociationField', 'x-component-props': { fieldNames: { label: 'name', value: 'id' } } } },
    { type: 'date', name: 'appointmentDate', interface: 'datetime', uiSchema: { type: 'string', title: '{{t("Date")}}', 'x-component': 'DatePicker' } },
    { type: 'string', name: 'timeSlot', interface: 'input', uiSchema: { type: 'string', title: '{{t("Time Slot")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'doctor', interface: 'input', uiSchema: { type: 'string', title: '{{t("Doctor")}}', 'x-component': 'Input' } },
    { type: 'string', name: 'department', interface: 'select', uiSchema: { type: 'string', title: '{{t("Department")}}', 'x-component': 'Select', enum: [{ label: '内科', value: 'internal' }, { label: '外科', value: 'surgery' }, { label: '儿科', value: 'pediatrics' }, { label: '妇科', value: 'gynecology' }, { label: '口腔科', value: 'dental' }, { label: '眼科', value: 'ophthalmology' }, { label: '中医科', value: 'tcm' }] } },
    { type: 'string', name: 'status', defaultValue: 'scheduled', interface: 'select', uiSchema: { type: 'string', title: '{{t("Status")}}', 'x-component': 'Select', enum: [{ label: '已预约', value: 'scheduled', color: 'blue' }, { label: '已到诊', value: 'checked_in', color: 'green' }, { label: '就诊中', value: 'in_progress', color: 'orange' }, { label: '已完成', value: 'completed', color: 'default' }, { label: '已取消', value: 'cancelled', color: 'red' }] } },
    { type: 'text', name: 'reason', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Visit Reason")}}', 'x-component': 'Input.TextArea' } },
    { type: 'text', name: 'notes', interface: 'textarea', uiSchema: { type: 'string', title: '{{t("Notes")}}', 'x-component': 'Input.TextArea' } },
  ],
});

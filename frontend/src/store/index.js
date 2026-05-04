import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import medicalRecordReducer from './slices/medicalRecordSlice';
import medicationReducer from './slices/medicationSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import invoiceReducer from './slices/invoiceSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    appointments: appointmentReducer,
    medicalRecords: medicalRecordReducer,
    medications: medicationReducer,
    prescriptions: prescriptionReducer,
    invoices: invoiceReducer,
    departments: departmentReducer,
  },
});

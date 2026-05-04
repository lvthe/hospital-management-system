const {
  createMedicalRecord, getMedicalRecords, getMedicalRecordById,
  getMedicalRecordsByPatient, updateMedicalRecord, deleteMedicalRecord,
} = require("../models/medicalRecordModel");
const { getPatientById } = require("../models/patientModel");
const { NotFoundError, AuthorizationError } = require("../utils/errorHandler");

const createRecord = async (data, requestingUser) => {
  const patient = await getPatientById(data.patient_id);
  if (!patient) throw new NotFoundError("Bệnh nhân");
  return createMedicalRecord(data);
};

const listRecords = async (queryParams) => getMedicalRecords(queryParams);

const getRecord = async (id) => {
  const record = await getMedicalRecordById(id);
  if (!record) throw new NotFoundError("Hồ sơ y tế");
  return record;
};

const getPatientRecords = async (patientId) => {
  const patient = await getPatientById(patientId);
  if (!patient) throw new NotFoundError("Bệnh nhân");
  return getMedicalRecordsByPatient(patientId);
};

const editRecord = async (id, updates, requestingUser) => {
  const record = await getMedicalRecordById(id);
  if (!record) throw new NotFoundError("Hồ sơ y tế");
  if (requestingUser.role === 'doctor' && record.doctor_id !== requestingUser.doctorId) {
    throw new AuthorizationError("Bạn không thể sửa hồ sơ của bác sĩ khác");
  }
  return updateMedicalRecord(id, updates);
};

const removeRecord = async (id) => {
  const record = await getMedicalRecordById(id);
  if (!record) throw new NotFoundError("Hồ sơ y tế");
  await deleteMedicalRecord(id);
};

module.exports = { createRecord, listRecords, getRecord, getPatientRecords, editRecord, removeRecord };

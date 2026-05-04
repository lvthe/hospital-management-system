const {
  createPrescription, getPrescriptionsByMedicalRecord, getPrescriptionById,
  getPrescriptionsByPatient, updatePrescription, deletePrescription,
} = require("../models/prescriptionModel");
const { getMedicationById, adjustStock } = require("../models/medicationModel");
const { NotFoundError, ValidationError } = require("../utils/errorHandler");

const addPrescription = async (data) => {
  if (!data.medical_record_id) throw new ValidationError("medical_record_id là bắt buộc");
  if (!data.medication_id)     throw new ValidationError("medication_id là bắt buộc");
  if (!data.dosage)            throw new ValidationError("dosage là bắt buộc");
  if (!data.frequency)         throw new ValidationError("frequency là bắt buộc");

  const med = await getMedicationById(data.medication_id);
  if (!med) throw new NotFoundError("Thuốc");

  const prescription = await createPrescription(data);
  return prescription;
};

const getByMedicalRecord = async (medicalRecordId) =>
  getPrescriptionsByMedicalRecord(medicalRecordId);

const getPrescription = async (id) => {
  const p = await getPrescriptionById(id);
  if (!p) throw new NotFoundError("Đơn thuốc");
  return p;
};

const getByPatient = async (patientId) => getPrescriptionsByPatient(patientId);

const editPrescription = async (id, updates) => {
  const p = await getPrescriptionById(id);
  if (!p) throw new NotFoundError("Đơn thuốc");
  return updatePrescription(id, updates);
};

const dispensePrescription = async (id) => {
  const p = await getPrescriptionById(id);
  if (!p) throw new NotFoundError("Đơn thuốc");
  if (p.dispensed_date) throw new ValidationError("Đơn thuốc này đã được cấp phát");

  const quantity = p.duration_days || 1;
  const med = await getMedicationById(p.medication_id);
  if (med.stock_quantity < quantity) throw new ValidationError("Không đủ thuốc trong kho");

  await adjustStock(p.medication_id, -quantity);
  return updatePrescription(id, { dispensed_date: new Date().toISOString() });
};

const removePrescription = async (id) => {
  const p = await getPrescriptionById(id);
  if (!p) throw new NotFoundError("Đơn thuốc");
  await deletePrescription(id);
};

module.exports = {
  addPrescription, getByMedicalRecord, getPrescription,
  getByPatient, editPrescription, dispensePrescription, removePrescription,
};

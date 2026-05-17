const {
  createPatientRecord, listPatients, getOnePatient,
  getMyPatientProfile, editPatient, removePatient,
} = require("../services/patientService");
const { getPatientRecords } = require("../services/medicalRecordService");
const { listAppointments } = require("../services/appointmentService");
const { getPatientInvoices } = require("../services/invoiceService");
const { patientSchema } = require("../utils/validators");
const { ValidationError } = require("../utils/errorHandler");

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', gender = '', blood_type = '' } = req.query;
    const result = await listPatients({
      page: parseInt(page), limit: parseInt(limit), search, gender, blood_type,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const patient = await getOnePatient(req.params.id);
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const patient = await getMyPatientProfile(req.user.id);
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = patientSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const patient = await createPatientRecord(value);
    res.status(201).json({ success: true, data: patient, message: "Tạo bệnh nhân thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const patient = await editPatient(req.params.id, req.body);
    res.json({ success: true, data: patient, message: "Cập nhật thành công" });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removePatient(req.params.id);
    res.json({ success: true, message: "Xóa bệnh nhân thành công" });
  } catch (err) { next(err); }
};

const getPatientMedicalRecords = async (req, res, next) => {
  try {
    const data = await getPatientRecords(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getPatientAppointments = async (req, res, next) => {
  try {
    const { status, date_from } = req.query;
    const result = await listAppointments(
      { page: 1, limit: 100, patient_id: req.params.id, status, date_from },
      req.user,
    );
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};

const getPatientInvoiceList = async (req, res, next) => {
  try {
    const data = await getPatientInvoices(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  list, get, getMyProfile, create, update, remove,
  getPatientMedicalRecords, getPatientAppointments, getPatientInvoiceList,
};

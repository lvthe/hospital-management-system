const {
  createRecord, listRecords, getRecord,
  getPatientRecords, editRecord, removeRecord,
} = require("../services/medicalRecordService");
const { ValidationError } = require("../utils/errorHandler");

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patient_id = '', doctor_id = '' } = req.query;
    const result = await listRecords({ page: parseInt(page), limit: parseInt(limit), patient_id, doctor_id });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const record = await getRecord(req.params.id);
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

const getByPatient = async (req, res, next) => {
  try {
    const records = await getPatientRecords(req.params.patientId);
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { patient_id, doctor_id } = req.body;
    if (!patient_id || !doctor_id) throw new ValidationError("patient_id và doctor_id là bắt buộc");
    const record = await createRecord(req.body, req.user);
    res.status(201).json({ success: true, data: record, message: "Tạo hồ sơ y tế thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const record = await editRecord(req.params.id, req.body, req.user);
    res.json({ success: true, data: record, message: "Cập nhật hồ sơ y tế thành công" });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removeRecord(req.params.id);
    res.json({ success: true, message: "Xóa hồ sơ y tế thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, getByPatient, create, update, remove };

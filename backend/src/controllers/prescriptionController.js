const {
  addPrescription, getByMedicalRecord, getPrescription,
  getByPatient, editPrescription, dispensePrescription, removePrescription,
} = require("../services/prescriptionService");

const getByRecord = async (req, res, next) => {
  try {
    const data = await getByMedicalRecord(req.params.recordId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const data = await getPrescription(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getPatientPrescriptions = async (req, res, next) => {
  try {
    const data = await getByPatient(req.params.patientId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await addPrescription(req.body);
    res.status(201).json({ success: true, data, message: "Tạo đơn thuốc thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await editPrescription(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật đơn thuốc thành công" });
  } catch (err) { next(err); }
};

const dispense = async (req, res, next) => {
  try {
    const data = await dispensePrescription(req.params.id);
    res.json({ success: true, data, message: "Cấp phát thuốc thành công" });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removePrescription(req.params.id);
    res.json({ success: true, message: "Xóa đơn thuốc thành công" });
  } catch (err) { next(err); }
};

module.exports = { getByRecord, get, getPatientPrescriptions, create, update, dispense, remove };

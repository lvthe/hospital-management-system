const {
  addInvoice, listInvoices, getInvoice,
  payInvoice, voidInvoice, getPatientInvoices,
} = require("../services/invoiceService");

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patient_id = '', status = '' } = req.query;
    const result = await listInvoices({ page: parseInt(page), limit: parseInt(limit), patient_id, status });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const inv = await getInvoice(req.params.id);
    res.json({ success: true, data: inv });
  } catch (err) { next(err); }
};

const getByPatient = async (req, res, next) => {
  try {
    const data = await getPatientInvoices(req.params.patientId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const inv = await addInvoice(req.body);
    res.status(201).json({ success: true, data: inv, message: "Tạo hóa đơn thành công" });
  } catch (err) { next(err); }
};

const payment = async (req, res, next) => {
  try {
    const inv = await payInvoice(req.params.id, req.body);
    res.json({ success: true, data: inv, message: "Ghi nhận thanh toán thành công" });
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const inv = await voidInvoice(req.params.id);
    res.json({ success: true, data: inv, message: "Hủy hóa đơn thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, getByPatient, create, payment, cancel };

const {
  createInvoice, getInvoices, getInvoiceById,
  recordPayment, cancelInvoice, getInvoicesByPatient,
} = require("../models/invoiceModel");
const { getPatientById } = require("../models/patientModel");
const { NotFoundError, ValidationError } = require("../utils/errorHandler");

const VALID_ITEM_TYPES = ['consultation', 'medication', 'test', 'equipment'];

const addInvoice = async (data) => {
  if (!data.patient_id)                     throw new ValidationError("patient_id là bắt buộc");
  if (!Array.isArray(data.items) || !data.items.length)
    throw new ValidationError("Cần ít nhất 1 mục trong hóa đơn");

  for (const item of data.items) {
    if (!VALID_ITEM_TYPES.includes(item.item_type))
      throw new ValidationError(`item_type không hợp lệ: ${item.item_type}`);
    if (!item.quantity || item.quantity < 1) throw new ValidationError("quantity phải >= 1");
    if (!item.unit_price || item.unit_price < 0) throw new ValidationError("unit_price không hợp lệ");
  }

  const patient = await getPatientById(data.patient_id);
  if (!patient) throw new NotFoundError("Bệnh nhân");

  return createInvoice(data);
};

const listInvoices = async (queryParams) => getInvoices(queryParams);

const getInvoice = async (id) => {
  const inv = await getInvoiceById(id);
  if (!inv) throw new NotFoundError("Hóa đơn");
  return inv;
};

const payInvoice = async (id, paymentData) => {
  const inv = await getInvoiceById(id);
  if (!inv) throw new NotFoundError("Hóa đơn");
  if (inv.status === 'paid')       throw new ValidationError("Hóa đơn đã được thanh toán");
  if (inv.status === 'cancelled')  throw new ValidationError("Hóa đơn đã bị hủy");
  if (!paymentData.amount_paid || paymentData.amount_paid <= 0)
    throw new ValidationError("Số tiền thanh toán không hợp lệ");

  return recordPayment(id, paymentData);
};

const voidInvoice = async (id) => {
  const inv = await getInvoiceById(id);
  if (!inv) throw new NotFoundError("Hóa đơn");
  if (inv.status === 'paid') throw new ValidationError("Không thể hủy hóa đơn đã thanh toán");
  return cancelInvoice(id);
};

const getPatientInvoices = async (patientId) => {
  const patient = await getPatientById(patientId);
  if (!patient) throw new NotFoundError("Bệnh nhân");
  return getInvoicesByPatient(patientId);
};

module.exports = { addInvoice, listInvoices, getInvoice, payInvoice, voidInvoice, getPatientInvoices };

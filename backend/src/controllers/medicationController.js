const {
  addMedication, listMedications, getMedication,
  editMedication, updateStock, removeMedication,
} = require("../services/medicationService");
const { ValidationError } = require("../utils/errorHandler");

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', low_stock = false } = req.query;
    const result = await listMedications({ page: parseInt(page), limit: parseInt(limit), search, low_stock });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const med = await getMedication(req.params.id);
    res.json({ success: true, data: med });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const med = await addMedication(req.body);
    res.status(201).json({ success: true, data: med, message: "Thêm thuốc thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const med = await editMedication(req.params.id, req.body);
    res.json({ success: true, data: med, message: "Cập nhật thuốc thành công" });
  } catch (err) { next(err); }
};

const adjustStock = async (req, res, next) => {
  try {
    const { delta } = req.body;
    if (delta === undefined) throw new ValidationError("delta là bắt buộc (số dương = nhập kho, âm = xuất kho)");
    const med = await updateStock(req.params.id, parseInt(delta));
    res.json({ success: true, data: med, message: "Cập nhật tồn kho thành công" });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removeMedication(req.params.id);
    res.json({ success: true, message: "Xóa thuốc thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, create, update, adjustStock, remove };

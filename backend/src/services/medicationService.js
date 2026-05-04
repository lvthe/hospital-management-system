const {
  createMedication, getMedications, getMedicationById,
  updateMedication, adjustStock, deleteMedication,
} = require("../models/medicationModel");
const { NotFoundError, ValidationError } = require("../utils/errorHandler");

const addMedication = async (data) => {
  if (!data.name) throw new ValidationError("Tên thuốc là bắt buộc");
  if (data.unit_price === undefined) throw new ValidationError("Giá thuốc là bắt buộc");
  if (data.stock_quantity === undefined) throw new ValidationError("Số lượng tồn kho là bắt buộc");
  return createMedication(data);
};

const listMedications = async (queryParams) => getMedications(queryParams);

const getMedication = async (id) => {
  const med = await getMedicationById(id);
  if (!med) throw new NotFoundError("Thuốc");
  return med;
};

const editMedication = async (id, updates) => {
  const med = await getMedicationById(id);
  if (!med) throw new NotFoundError("Thuốc");
  return updateMedication(id, updates);
};

const updateStock = async (id, delta) => {
  const med = await getMedicationById(id);
  if (!med) throw new NotFoundError("Thuốc");
  if (med.stock_quantity + delta < 0) throw new ValidationError("Số lượng tồn kho không đủ");
  return adjustStock(id, delta);
};

const removeMedication = async (id) => {
  const med = await getMedicationById(id);
  if (!med) throw new NotFoundError("Thuốc");
  await deleteMedication(id);
};

module.exports = { addMedication, listMedications, getMedication, editMedication, updateStock, removeMedication };

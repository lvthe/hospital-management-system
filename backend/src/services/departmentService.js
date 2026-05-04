const {
  createDepartment, getDepartments, getDepartmentById,
  updateDepartment, deleteDepartment,
} = require("../models/departmentModel");
const { NotFoundError, ValidationError, ConflictError } = require("../utils/errorHandler");
const { query } = require("../config/database");

const addDepartment = async (data) => {
  if (!data.name) throw new ValidationError("Tên phòng ban là bắt buộc");
  if (!data.code) throw new ValidationError("Mã phòng ban là bắt buộc");

  const existing = await query(`SELECT id FROM departments WHERE code = $1 LIMIT 1`, [data.code]);
  if (existing.rows.length) throw new ConflictError(`Mã phòng ban '${data.code}' đã tồn tại`);

  return createDepartment(data);
};

const listDepartments = async (queryParams) => getDepartments(queryParams);

const getDepartment = async (id) => {
  const dept = await getDepartmentById(id);
  if (!dept) throw new NotFoundError("Phòng ban");
  return dept;
};

const editDepartment = async (id, updates) => {
  const dept = await getDepartmentById(id);
  if (!dept) throw new NotFoundError("Phòng ban");
  return updateDepartment(id, updates);
};

const removeDepartment = async (id) => {
  const dept = await getDepartmentById(id);
  if (!dept) throw new NotFoundError("Phòng ban");
  await deleteDepartment(id);
};

module.exports = { addDepartment, listDepartments, getDepartment, editDepartment, removeDepartment };

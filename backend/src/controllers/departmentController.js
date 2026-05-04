const {
  addDepartment, listDepartments, getDepartment, editDepartment, removeDepartment,
} = require("../services/departmentService");

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await listDepartments({ page: parseInt(page), limit: parseInt(limit), search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const dept = await getDepartment(req.params.id);
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const dept = await addDepartment(req.body);
    res.status(201).json({ success: true, data: dept, message: "Tạo phòng ban thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const dept = await editDepartment(req.params.id, req.body);
    res.json({ success: true, data: dept, message: "Cập nhật phòng ban thành công" });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removeDepartment(req.params.id);
    res.json({ success: true, message: "Xóa phòng ban thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, create, update, remove };

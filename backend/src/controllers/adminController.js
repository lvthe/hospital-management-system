const { getUsers, getUserById, updateUserRole, toggleUserActive } = require("../models/userModel");
const { NotFoundError, ValidationError } = require("../utils/errorHandler");

const VALID_ROLES = ['patient', 'doctor', 'nurse', 'receptionist', 'admin'];

const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role = '', search = '' } = req.query;
    const result = await getUsers({ page: parseInt(page), limit: parseInt(limit), role, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) throw new NotFoundError("Người dùng");
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !VALID_ROLES.includes(role)) {
      throw new ValidationError(`role phải là một trong: ${VALID_ROLES.join(', ')}`);
    }
    const user = await getUserById(req.params.id);
    if (!user) throw new NotFoundError("Người dùng");
    if (req.user.id === req.params.id) throw new ValidationError("Không thể đổi role của chính mình");

    const updated = await updateUserRole(req.params.id, role);
    res.json({ success: true, data: updated, message: "Đổi role thành công" });
  } catch (err) { next(err); }
};

const setActive = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') throw new ValidationError("is_active phải là boolean");
    const user = await getUserById(req.params.id);
    if (!user) throw new NotFoundError("Người dùng");
    if (req.user.id === req.params.id) throw new ValidationError("Không thể khoá tài khoản của chính mình");

    const updated = await toggleUserActive(req.params.id, is_active);
    res.json({ success: true, data: updated, message: is_active ? "Kích hoạt tài khoản thành công" : "Khoá tài khoản thành công" });
  } catch (err) { next(err); }
};

let _settings = {
  hospital_name: process.env.HOSPITAL_NAME || "Hospital Management System",
  max_appointment_duration: 30,
  appointment_reminder_time: 24,
  business_hours_start: "08:00",
  business_hours_end: "17:30",
};

const getSettings = async (req, res, next) => {
  try {
    res.json({ success: true, data: _settings });
  } catch (err) { next(err); }
};

const updateSettings = async (req, res, next) => {
  try {
    const allowed = ['hospital_name', 'max_appointment_duration', 'appointment_reminder_time', 'business_hours_start', 'business_hours_end'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) _settings[key] = req.body[key];
    }
    res.json({ success: true, data: _settings, message: "Cập nhật cài đặt thành công" });
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUser, changeRole, setActive, getSettings, updateSettings };

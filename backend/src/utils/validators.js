/**
 * ==================================================
 * Validation Utilities
 * ==================================================
 * File: src/utils/validators.js
 * Description: Các hàm validate dữ liệu đầu vào
 */

const Joi = require("joi");

/**
 * Validate email format
 * @param {string} email - Email
 * @returns {boolean} True nếu hợp lệ
 */
const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  return !error;
};

/**
 * Validate mật khẩu
 * Yêu cầu: ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
 * @param {string} password - Mật khẩu
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 số");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate số điện thoại
 * @param {string} phone - Số điện thoại
 * @returns {boolean} True nếu hợp lệ
 */
const validatePhone = (phone) => {
  // Kiểm tra số điện thoại Việt Nam
  const vietnamPhoneRegex = /^(\+84|0)[1-9]\d{8,9}$/;
  return vietnamPhoneRegex.test(phone);
};

/**
 * Validate UUID
 * @param {string} uuid - UUID string
 * @returns {boolean} True nếu hợp lệ
 */
const validateUUID = (uuid) => {
  const schema = Joi.string().uuid().required();
  const { error } = schema.validate(uuid);
  return !error;
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Ngày tháng
 * @returns {boolean} True nếu hợp lệ
 */
const validateDate = (date) => {
  const schema = Joi.date().iso().required();
  const { error } = schema.validate(date);
  return !error;
};

/**
 * Validate role
 * @param {string} role - Vai trò
 * @returns {boolean} True nếu hợp lệ
 */
const validateRole = (role) => {
  const validRoles = ["admin", "doctor", "nurse", "receptionist", "patient"];
  return validRoles.includes(role);
};

/**
 * Validate gender
 * @param {string} gender - Giới tính (M, F, Other)
 * @returns {boolean} True nếu hợp lệ
 */
const validateGender = (gender) => {
  const validGenders = ["M", "F", "Other"];
  return validGenders.includes(gender);
};

/**
 * Validate blood type
 * @param {string} bloodType - Nhóm máu
 * @returns {boolean} True nếu hợp lệ
 */
const validateBloodType = (bloodType) => {
  const validBloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  return validBloodTypes.includes(bloodType);
};

/**
 * Schema validate cho User Registration
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  full_name: Joi.string().max(100).required().messages({
    "string.max": "Tên không vượt quá 100 ký tự",
    "any.required": "Tên là bắt buộc",
  }),
  phone: Joi.string().optional().messages({
    "string.pattern.base": "Số điện thoại không hợp lệ",
  }),
  role: Joi.string()
    .valid("patient", "doctor", "nurse", "receptionist")
    .default("patient"),
});

/**
 * Schema validate cho User Login
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

/**
 * Schema validate cho Patient Creation
 */
const patientSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().max(100).required(),
  phone: Joi.string().optional(),
  date_of_birth: Joi.date().iso().optional(),
  gender: Joi.string().valid("M", "F", "Other").optional(),
  blood_type: Joi.string()
    .valid("O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-")
    .optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  emergency_contact_name: Joi.string().optional(),
  emergency_contact_phone: Joi.string().optional(),
  insurance_provider: Joi.string().optional(),
  insurance_policy_number: Joi.string().optional(),
});

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUUID,
  validateDate,
  validateRole,
  validateGender,
  validateBloodType,
  registerSchema,
  loginSchema,
  patientSchema,
};

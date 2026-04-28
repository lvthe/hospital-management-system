const { createDoctorRecord, listDoctors, getOneDoctor, getMyDoctorProfile, editDoctor } = require("../services/doctorService");
const { ValidationError } = require("../utils/errorHandler");
const Joi = require("joi");

const doctorCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().max(100).required(),
  phone: Joi.string().optional(),
  specialist: Joi.string().required(),
  license_number: Joi.string().required(),
  license_expiry: Joi.date().iso().optional(),
  phone_extension: Joi.string().optional(),
  office_room: Joi.string().optional(),
  max_patients_per_day: Joi.number().integer().min(1).optional(),
  bio: Joi.string().optional(),
});

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', specialist = '' } = req.query;
    const result = await listDoctors({ page: parseInt(page), limit: parseInt(limit), search, specialist });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const doctor = await getOneDoctor(req.params.id);
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await getMyDoctorProfile(req.user.id);
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = doctorCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));
    const doctor = await createDoctorRecord(value);
    res.status(201).json({ success: true, data: doctor, message: "Tạo bác sĩ thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const doctor = await editDoctor(req.params.id, req.body);
    res.json({ success: true, data: doctor, message: "Cập nhật thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, getMyProfile, create, update };

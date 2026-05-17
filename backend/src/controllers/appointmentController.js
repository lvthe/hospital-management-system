const {
  bookAppointment, listAppointments, getOneAppointment,
  editAppointment, cancelAppointment,
  getDoctorAvailableSlots, changeAppointmentStatus,
} = require("../services/appointmentService");
const { ValidationError } = require("../utils/errorHandler");
const Joi = require("joi");

const appointmentSchema = Joi.object({
  patient_id: Joi.string().uuid().required(),
  doctor_id: Joi.string().uuid().required(),
  appointment_date: Joi.date().iso().min('now').required(),
  appointment_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  duration_minutes: Joi.number().integer().min(15).max(120).optional(),
  reason_for_visit: Joi.string().max(500).optional(),
  notes: Joi.string().max(500).optional(),
});

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patient_id, doctor_id, status, date_from, date_to } = req.query;
    const result = await listAppointments(
      { page: parseInt(page), limit: parseInt(limit), patient_id, doctor_id, status, date_from, date_to },
      req.user,
    );
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const appt = await getOneAppointment(req.params.id, req.user);
    res.json({ success: true, data: appt });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));
    const appt = await bookAppointment(value, req.user);
    res.status(201).json({ success: true, data: appt, message: "Đặt lịch hẹn thành công" });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const appt = await editAppointment(req.params.id, req.body, req.user);
    res.json({ success: true, data: appt, message: "Cập nhật lịch hẹn thành công" });
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const appt = await cancelAppointment(req.params.id, req.user);
    res.json({ success: true, data: appt, message: "Hủy lịch hẹn thành công" });
  } catch (err) { next(err); }
};

const getAvailability = async (req, res, next) => {
  try {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) throw new ValidationError("doctor_id và date là bắt buộc");
    const slots = await getDoctorAvailableSlots(doctor_id, date);
    res.json({ success: true, data: { doctor_id, date, available_slots: slots } });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const appt = await changeAppointmentStatus(req.params.id, req.body, req.user);
    res.json({ success: true, data: appt, message: "Cập nhật trạng thái thành công" });
  } catch (err) { next(err); }
};

module.exports = { list, get, create, update, cancel, getAvailability, updateStatus };

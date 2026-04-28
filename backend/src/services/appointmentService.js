const {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, updateAppointmentStatus, checkDoctorAvailability,
} = require("../models/appointmentModel");
const { getPatientByUserId } = require("../models/patientModel");
const { getDoctorByUserId } = require("../models/doctorModel");
const { NotFoundError, ValidationError, AuthorizationError } = require("../utils/errorHandler");

const bookAppointment = async (data, requestUser) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason_for_visit, notes } = data;

  const available = await checkDoctorAvailability(doctor_id, appointment_date, appointment_time);
  if (!available) throw new ValidationError("Bác sĩ đã có lịch hẹn vào thời gian này");

  return createAppointment({ patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason_for_visit, notes });
};

const listAppointments = async (filters, requestUser) => {
  if (requestUser.role === 'patient') {
    const patient = await getPatientByUserId(requestUser.id);
    if (!patient) throw new NotFoundError("Hồ sơ bệnh nhân");
    filters.patient_id = patient.id;
  } else if (requestUser.role === 'doctor') {
    const doctor = await getDoctorByUserId(requestUser.id);
    if (!doctor) throw new NotFoundError("Hồ sơ bác sĩ");
    filters.doctor_id = doctor.id;
  }
  return getAppointments(filters);
};

const getOneAppointment = async (id, requestUser) => {
  const appt = await getAppointmentById(id);
  if (!appt) throw new NotFoundError("Lịch hẹn");

  if (requestUser.role === 'patient') {
    const patient = await getPatientByUserId(requestUser.id);
    if (!patient || appt.patient_id !== patient.id) throw new AuthorizationError();
  } else if (requestUser.role === 'doctor') {
    const doctor = await getDoctorByUserId(requestUser.id);
    if (!doctor || appt.doctor_id !== doctor.id) throw new AuthorizationError();
  }

  return appt;
};

const editAppointment = async (id, updates, requestUser) => {
  const appt = await getAppointmentById(id);
  if (!appt) throw new NotFoundError("Lịch hẹn");

  if (updates.appointment_date || updates.appointment_time) {
    const date = updates.appointment_date || appt.appointment_date;
    const time = updates.appointment_time || appt.appointment_time;
    const available = await checkDoctorAvailability(appt.doctor_id, date, time, id);
    if (!available) throw new ValidationError("Bác sĩ đã có lịch hẹn vào thời gian này");
  }

  return updateAppointment(id, updates);
};

const cancelAppointment = async (id, requestUser) => {
  const appt = await getAppointmentById(id);
  if (!appt) throw new NotFoundError("Lịch hẹn");

  if (appt.status === 'cancelled') throw new ValidationError("Lịch hẹn đã bị hủy trước đó");
  if (appt.status === 'completed') throw new ValidationError("Không thể hủy lịch hẹn đã hoàn thành");

  return updateAppointmentStatus(id, 'cancelled');
};

module.exports = { bookAppointment, listAppointments, getOneAppointment, editAppointment, cancelAppointment };

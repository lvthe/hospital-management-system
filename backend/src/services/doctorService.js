const { getUserByEmail, createUser } = require("../models/userModel");
const { getDoctors, getDoctorById, getDoctorByUserId, createDoctor, updateDoctor } = require("../models/doctorModel");
const { hashPassword } = require("../utils/auth");
const { ConflictError, NotFoundError } = require("../utils/errorHandler");

const createDoctorRecord = async (data) => {
  const { email, password, full_name, phone, ...doctorData } = data;
  const existing = await getUserByEmail(email);
  if (existing) throw new ConflictError("Email đã được đăng ký");

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, full_name, phone, avatar_url: null, role: "doctor" });
  const doctor = await createDoctor({ user_id: user.id, ...doctorData });
  return { ...doctor, full_name: user.full_name, email: user.email, phone: user.phone };
};

const listDoctors = async (query) => getDoctors(query);

const getOneDoctor = async (id) => {
  const doctor = await getDoctorById(id);
  if (!doctor) throw new NotFoundError("Bác sĩ");
  return doctor;
};

const getMyDoctorProfile = async (userId) => {
  const doctor = await getDoctorByUserId(userId);
  if (!doctor) throw new NotFoundError("Hồ sơ bác sĩ");
  return doctor;
};

const editDoctor = async (id, updates) => {
  const existing = await getDoctorById(id);
  if (!existing) throw new NotFoundError("Bác sĩ");
  return updateDoctor(id, updates);
};

module.exports = { createDoctorRecord, listDoctors, getOneDoctor, getMyDoctorProfile, editDoctor };

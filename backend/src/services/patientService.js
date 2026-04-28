const { getUserByEmail, createUser } = require("../models/userModel");
const {
  createPatient, getPatients, getPatientById,
  getPatientByUserId, updatePatient, deletePatient,
} = require("../models/patientModel");
const { hashPassword } = require("../utils/auth");
const { ConflictError, NotFoundError, ValidationError } = require("../utils/errorHandler");

const createPatientRecord = async (data) => {
  const { email, password, full_name, phone, ...patientData } = data;

  const existing = await getUserByEmail(email);
  if (existing) throw new ConflictError("Email đã được đăng ký");

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, full_name, phone, avatar_url: null, role: "patient" });
  const patient = await createPatient({ user_id: user.id, ...patientData });

  return { ...patient, full_name: user.full_name, email: user.email, phone: user.phone };
};

const listPatients = async (query) => {
  return getPatients(query);
};

const getOnePatient = async (id) => {
  const patient = await getPatientById(id);
  if (!patient) throw new NotFoundError("Bệnh nhân");
  return patient;
};

const getMyPatientProfile = async (userId) => {
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new NotFoundError("Hồ sơ bệnh nhân");
  return patient;
};

const editPatient = async (id, updates) => {
  const existing = await getPatientById(id);
  if (!existing) throw new NotFoundError("Bệnh nhân");
  return updatePatient(id, updates);
};

const removePatient = async (id) => {
  const existing = await getPatientById(id);
  if (!existing) throw new NotFoundError("Bệnh nhân");
  await deletePatient(id);
};

module.exports = {
  createPatientRecord,
  listPatients,
  getOnePatient,
  getMyPatientProfile,
  editPatient,
  removePatient,
};

const { query } = require("../config/database");

const generateMedicalRecordNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  return `MRN-${year}-${randomSuffix}`;
};

const createPatient = async ({
  user_id,
  date_of_birth,
  gender,
  blood_type,
  allergies,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_policy_number,
}) => {
  const medicalRecordNumber = generateMedicalRecordNumber();
  const sql = `
    INSERT INTO patients (
      user_id, medical_record_number, date_of_birth, gender, blood_type,
      allergies, emergency_contact_name, emergency_contact_phone,
      emergency_contact_relationship, insurance_provider, insurance_policy_number
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id, user_id, medical_record_number, date_of_birth, gender, blood_type,
              allergies, emergency_contact_name, emergency_contact_phone,
              emergency_contact_relationship, insurance_provider, insurance_policy_number,
              created_at, updated_at
  `;
  const result = await query(sql, [
    user_id, medicalRecordNumber, date_of_birth || null, gender || null,
    blood_type || null, allergies || null, emergency_contact_name || null,
    emergency_contact_phone || null, emergency_contact_relationship || null,
    insurance_provider || null, insurance_policy_number || null,
  ]);
  return result.rows[0];
};

const getPatients = async ({ page = 1, limit = 10, search = '', gender = '', blood_type = '' }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR p.medical_record_number ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (gender) {
    conditions.push(`p.gender = $${idx}`);
    values.push(gender);
    idx++;
  }
  if (blood_type) {
    conditions.push(`p.blood_type = $${idx}`);
    values.push(blood_type);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) FROM patients p
    JOIN users u ON p.user_id = u.id
    ${where}
  `;
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataSql = `
    SELECT p.id, p.user_id, p.medical_record_number, p.date_of_birth, p.gender,
           p.blood_type, p.allergies, p.emergency_contact_name, p.emergency_contact_phone,
           p.emergency_contact_relationship, p.insurance_provider, p.insurance_policy_number,
           p.created_at, p.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active
    FROM patients p
    JOIN users u ON p.user_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);

  return {
    data: result.rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getPatientById = async (id) => {
  const sql = `
    SELECT p.id, p.user_id, p.medical_record_number, p.date_of_birth, p.gender,
           p.blood_type, p.allergies, p.emergency_contact_name, p.emergency_contact_phone,
           p.emergency_contact_relationship, p.insurance_provider, p.insurance_policy_number,
           p.created_at, p.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
    LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const getPatientByUserId = async (userId) => {
  const sql = `
    SELECT p.id, p.user_id, p.medical_record_number, p.date_of_birth, p.gender,
           p.blood_type, p.allergies, p.emergency_contact_name, p.emergency_contact_phone,
           p.emergency_contact_relationship, p.insurance_provider, p.insurance_policy_number,
           p.created_at, p.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = $1
    LIMIT 1
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

const updatePatient = async (id, updates) => {
  const allowed = [
    'date_of_birth', 'gender', 'blood_type', 'allergies',
    'emergency_contact_name', 'emergency_contact_phone',
    'emergency_contact_relationship', 'insurance_provider', 'insurance_policy_number',
  ];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (!fields.length) return getPatientById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const sql = `
    UPDATE patients SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, user_id, medical_record_number, date_of_birth, gender, blood_type,
              allergies, emergency_contact_name, emergency_contact_phone,
              emergency_contact_relationship, insurance_provider, insurance_policy_number,
              created_at, updated_at
  `;
  const result = await query(sql, values);
  return result.rows[0] || null;
};

const deletePatient = async (id) => {
  const sql = `DELETE FROM patients WHERE id = $1 RETURNING id`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  getPatientByUserId,
  updatePatient,
  deletePatient,
  generateMedicalRecordNumber,
};

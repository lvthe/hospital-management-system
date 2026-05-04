const { query } = require("../config/database");

const createMedicalRecord = async ({
  patient_id, doctor_id, appointment_id,
  diagnosis, symptoms, vital_signs, treatment_plan, notes,
}) => {
  const sql = `
    INSERT INTO medical_records
      (patient_id, doctor_id, appointment_id, diagnosis, symptoms, vital_signs, treatment_plan, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;
  const result = await query(sql, [
    patient_id, doctor_id, appointment_id || null,
    diagnosis || null, symptoms || null,
    vital_signs ? JSON.stringify(vital_signs) : null,
    treatment_plan || null, notes || null,
  ]);
  return result.rows[0];
};

const getMedicalRecords = async ({ page = 1, limit = 10, patient_id = '', doctor_id = '' }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (patient_id) { conditions.push(`mr.patient_id = $${idx++}`); values.push(patient_id); }
  if (doctor_id)  { conditions.push(`mr.doctor_id = $${idx++}`);  values.push(doctor_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = parseInt(
    (await query(`SELECT COUNT(*) FROM medical_records mr ${where}`, values)).rows[0].count, 10
  );

  const dataSql = `
    SELECT mr.*,
           pu.full_name AS patient_name,
           du.full_name AS doctor_name,
           d.specialist  AS doctor_specialist
    FROM medical_records mr
    JOIN patients p  ON mr.patient_id = p.id
    JOIN users    pu ON p.user_id      = pu.id
    JOIN doctors  d  ON mr.doctor_id   = d.id
    JOIN users    du ON d.user_id      = du.id
    ${where}
    ORDER BY mr.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);
  return { data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getMedicalRecordById = async (id) => {
  const sql = `
    SELECT mr.*,
           pu.full_name AS patient_name, p.medical_record_number,
           du.full_name AS doctor_name,  d.specialist AS doctor_specialist
    FROM medical_records mr
    JOIN patients p  ON mr.patient_id = p.id
    JOIN users    pu ON p.user_id      = pu.id
    JOIN doctors  d  ON mr.doctor_id   = d.id
    JOIN users    du ON d.user_id      = du.id
    WHERE mr.id = $1 LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const getMedicalRecordsByPatient = async (patientId) => {
  const sql = `
    SELECT mr.*, du.full_name AS doctor_name, d.specialist AS doctor_specialist
    FROM medical_records mr
    JOIN doctors d  ON mr.doctor_id = d.id
    JOIN users   du ON d.user_id    = du.id
    WHERE mr.patient_id = $1
    ORDER BY mr.created_at DESC
  `;
  const result = await query(sql, [patientId]);
  return result.rows;
};

const updateMedicalRecord = async (id, updates) => {
  const allowed = ['diagnosis', 'symptoms', 'vital_signs', 'treatment_plan', 'notes'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(key === 'vital_signs' ? JSON.stringify(updates[key]) : updates[key]);
    }
  }
  if (!fields.length) return getMedicalRecordById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE medical_records SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteMedicalRecord = async (id) => {
  const result = await query(`DELETE FROM medical_records WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createMedicalRecord, getMedicalRecords, getMedicalRecordById,
  getMedicalRecordsByPatient, updateMedicalRecord, deleteMedicalRecord,
};

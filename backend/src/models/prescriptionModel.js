const { query } = require("../config/database");

const createPrescription = async ({
  medical_record_id, medication_id, dosage, frequency,
  duration_days, instructions, dispensed_date,
}) => {
  const sql = `
    INSERT INTO prescriptions
      (medical_record_id, medication_id, dosage, frequency, duration_days, instructions, dispensed_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
  `;
  const result = await query(sql, [
    medical_record_id, medication_id, dosage, frequency,
    duration_days || null, instructions || null, dispensed_date || null,
  ]);
  return result.rows[0];
};

const getPrescriptionsByMedicalRecord = async (medicalRecordId) => {
  const sql = `
    SELECT pr.*,
           m.name AS medication_name, m.dosage AS medication_dosage,
           m.unit_price, m.stock_quantity
    FROM prescriptions pr
    JOIN medications m ON pr.medication_id = m.id
    WHERE pr.medical_record_id = $1
    ORDER BY pr.created_at ASC
  `;
  const result = await query(sql, [medicalRecordId]);
  return result.rows;
};

const getPrescriptionById = async (id) => {
  const sql = `
    SELECT pr.*,
           m.name AS medication_name, m.dosage AS medication_dosage, m.unit_price,
           mr.diagnosis, mr.patient_id
    FROM prescriptions pr
    JOIN medications  m  ON pr.medication_id      = m.id
    JOIN medical_records mr ON pr.medical_record_id = mr.id
    WHERE pr.id = $1 LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const getPrescriptionsByPatient = async (patientId) => {
  const sql = `
    SELECT pr.*,
           m.name AS medication_name, m.dosage AS medication_dosage, m.unit_price,
           mr.diagnosis, mr.created_at AS visit_date,
           du.full_name AS doctor_name
    FROM prescriptions pr
    JOIN medications     m  ON pr.medication_id      = m.id
    JOIN medical_records mr ON pr.medical_record_id  = mr.id
    JOIN doctors         d  ON mr.doctor_id          = d.id
    JOIN users           du ON d.user_id             = du.id
    WHERE mr.patient_id = $1
    ORDER BY pr.created_at DESC
  `;
  const result = await query(sql, [patientId]);
  return result.rows;
};

const updatePrescription = async (id, updates) => {
  const allowed = ['dosage', 'frequency', 'duration_days', 'instructions', 'dispensed_date'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return getPrescriptionById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deletePrescription = async (id) => {
  const result = await query(`DELETE FROM prescriptions WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createPrescription, getPrescriptionsByMedicalRecord, getPrescriptionById,
  getPrescriptionsByPatient, updatePrescription, deletePrescription,
};

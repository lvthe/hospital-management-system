const { query } = require("../config/database");

const createAppointment = async ({ patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason_for_visit, notes }) => {
  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason_for_visit, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, patient_id, doctor_id, appointment_date, appointment_time,
              duration_minutes, status, reason_for_visit, notes, created_at, updated_at
  `;
  const result = await query(sql, [
    patient_id, doctor_id, appointment_date, appointment_time,
    duration_minutes || 30, reason_for_visit || null, notes || null,
  ]);
  return result.rows[0];
};

const getAppointments = async ({ page = 1, limit = 10, patient_id, doctor_id, status, date_from, date_to }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (patient_id) { conditions.push(`a.patient_id = $${idx}`); values.push(patient_id); idx++; }
  if (doctor_id) { conditions.push(`a.doctor_id = $${idx}`); values.push(doctor_id); idx++; }
  if (status) { conditions.push(`a.status = $${idx}`); values.push(status); idx++; }
  if (date_from) { conditions.push(`a.appointment_date >= $${idx}`); values.push(date_from); idx++; }
  if (date_to) { conditions.push(`a.appointment_date <= $${idx}`); values.push(date_to); idx++; }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) FROM appointments a ${where}`;
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataSql = `
    SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time,
           a.duration_minutes, a.status, a.reason_for_visit, a.notes,
           a.created_at, a.updated_at,
           up.full_name AS patient_name, up.email AS patient_email,
           ud.full_name AS doctor_name, doc.specialist
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users up ON p.user_id = up.id
    JOIN doctors doc ON a.doctor_id = doc.id
    JOIN users ud ON doc.user_id = ud.id
    ${where}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);

  return {
    data: result.rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getAppointmentById = async (id) => {
  const sql = `
    SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time,
           a.duration_minutes, a.status, a.reason_for_visit, a.notes,
           a.created_at, a.updated_at,
           up.full_name AS patient_name, up.email AS patient_email,
           ud.full_name AS doctor_name, doc.specialist
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users up ON p.user_id = up.id
    JOIN doctors doc ON a.doctor_id = doc.id
    JOIN users ud ON doc.user_id = ud.id
    WHERE a.id = $1
    LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const updateAppointmentStatus = async (id, status, notes) => {
  const sql = `
    UPDATE appointments
    SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, patient_id, doctor_id, appointment_date, appointment_time,
              duration_minutes, status, reason_for_visit, notes, created_at, updated_at
  `;
  const result = await query(sql, [status, notes || null, id]);
  return result.rows[0] || null;
};

const updateAppointment = async (id, updates) => {
  const allowed = ['appointment_date', 'appointment_time', 'duration_minutes', 'status', 'reason_for_visit', 'notes'];
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

  if (!fields.length) return getAppointmentById(id);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const sql = `
    UPDATE appointments SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, patient_id, doctor_id, appointment_date, appointment_time,
              duration_minutes, status, reason_for_visit, notes, created_at, updated_at
  `;
  const result = await query(sql, values);
  return result.rows[0] || null;
};

const checkDoctorAvailability = async (doctor_id, appointment_date, appointment_time, exclude_id = null) => {
  let sql = `
    SELECT id FROM appointments
    WHERE doctor_id = $1
      AND appointment_date = $2
      AND appointment_time = $3
      AND status NOT IN ('cancelled', 'no-show')
  `;
  const values = [doctor_id, appointment_date, appointment_time];
  if (exclude_id) {
    sql += ` AND id != $4`;
    values.push(exclude_id);
  }
  const result = await query(sql, values);
  return result.rows.length === 0;
};

const getBookedSlots = async (doctor_id, date) => {
  const sql = `
    SELECT appointment_time FROM appointments
    WHERE doctor_id = $1 AND appointment_date = $2
      AND status NOT IN ('cancelled', 'no-show')
  `;
  const result = await query(sql, [doctor_id, date]);
  return result.rows.map(r => r.appointment_time.slice(0, 5));
};

module.exports = {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, updateAppointmentStatus, checkDoctorAvailability,
  getBookedSlots,
};

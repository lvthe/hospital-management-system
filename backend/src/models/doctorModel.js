const { query } = require("../config/database");

const getDoctors = async ({ page = 1, limit = 10, search = '', specialist = '', department_id = '' }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(u.full_name ILIKE $${idx} OR d.specialist ILIKE $${idx} OR d.license_number ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (specialist) {
    conditions.push(`d.specialist ILIKE $${idx}`);
    values.push(`%${specialist}%`);
    idx++;
  }
  if (department_id) {
    conditions.push(`dep.id = $${idx}`);
    values.push(department_id);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dep ON dep.leader_id = d.id
    ${where}
  `;
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataSql = `
    SELECT d.id, d.user_id, d.specialist, d.license_number, d.license_expiry,
           d.phone_extension, d.office_room, d.max_patients_per_day, d.bio,
           d.created_at, d.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active,
           dep.id AS department_id, dep.name AS department_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dep ON dep.leader_id = d.id
    ${where}
    ORDER BY u.full_name ASC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);

  return {
    data: result.rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getDoctorById = async (id) => {
  const sql = `
    SELECT d.id, d.user_id, d.specialist, d.license_number, d.license_expiry,
           d.phone_extension, d.office_room, d.max_patients_per_day, d.bio,
           d.created_at, d.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = $1
    LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const getDoctorByUserId = async (userId) => {
  const sql = `
    SELECT d.id, d.user_id, d.specialist, d.license_number, d.license_expiry,
           d.phone_extension, d.office_room, d.max_patients_per_day, d.bio,
           d.created_at, d.updated_at,
           u.full_name, u.email, u.phone, u.avatar_url, u.is_active
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE d.user_id = $1
    LIMIT 1
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

const createDoctor = async ({
  user_id, specialist, license_number, license_expiry,
  phone_extension, office_room, max_patients_per_day, bio,
}) => {
  const sql = `
    INSERT INTO doctors (user_id, specialist, license_number, license_expiry,
      phone_extension, office_room, max_patients_per_day, bio)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id, user_id, specialist, license_number, license_expiry,
              phone_extension, office_room, max_patients_per_day, bio, created_at, updated_at
  `;
  const result = await query(sql, [
    user_id, specialist, license_number, license_expiry || null,
    phone_extension || null, office_room || null, max_patients_per_day || 20, bio || null,
  ]);
  return result.rows[0];
};

const updateDoctor = async (id, updates) => {
  const allowed = ['specialist', 'license_number', 'license_expiry', 'phone_extension', 'office_room', 'max_patients_per_day', 'bio'];
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

  if (!fields.length) return getDoctorById(id);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const sql = `
    UPDATE doctors SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, user_id, specialist, license_number, license_expiry,
              phone_extension, office_room, max_patients_per_day, bio, created_at, updated_at
  `;
  const result = await query(sql, values);
  return result.rows[0] || null;
};

module.exports = { getDoctors, getDoctorById, getDoctorByUserId, createDoctor, updateDoctor };

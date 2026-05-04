const { query } = require("../config/database");

const createDepartment = async ({ name, code, leader_id, phone, location, floor }) => {
  const sql = `
    INSERT INTO departments (name, code, leader_id, phone, location, floor)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `;
  const result = await query(sql, [name, code, leader_id || null, phone || null, location || null, floor || null]);
  return result.rows[0];
};

const getDepartments = async ({ page = 1, limit = 20, search = '' }) => {
  const offset = (page - 1) * limit;
  const values = [];
  let where = '';
  let idx = 1;

  if (search) {
    where = `WHERE (d.name ILIKE $${idx} OR d.code ILIKE $${idx})`;
    values.push(`%${search}%`);
    idx++;
  }

  const total = parseInt(
    (await query(`SELECT COUNT(*) FROM departments d ${where}`, values)).rows[0].count, 10
  );

  const dataSql = `
    SELECT d.*, u.full_name AS leader_name, doc.specialist AS leader_specialist
    FROM departments d
    LEFT JOIN doctors doc ON d.leader_id = doc.id
    LEFT JOIN users   u   ON doc.user_id = u.id
    ${where}
    ORDER BY d.name ASC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);
  return { data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getDepartmentById = async (id) => {
  const sql = `
    SELECT d.*, u.full_name AS leader_name, doc.specialist AS leader_specialist
    FROM departments d
    LEFT JOIN doctors doc ON d.leader_id = doc.id
    LEFT JOIN users   u   ON doc.user_id = u.id
    WHERE d.id = $1 LIMIT 1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

const updateDepartment = async (id, updates) => {
  const allowed = ['name', 'code', 'leader_id', 'phone', 'location', 'floor'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return getDepartmentById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE departments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteDepartment = async (id) => {
  const result = await query(`DELETE FROM departments WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createDepartment, getDepartments, getDepartmentById,
  updateDepartment, deleteDepartment,
};

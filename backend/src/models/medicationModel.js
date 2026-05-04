const { query } = require("../config/database");

const createMedication = async ({
  name, dosage, description, side_effects, drug_interactions,
  stock_quantity, unit_price, reorder_level, expiry_date,
}) => {
  const sql = `
    INSERT INTO medications
      (name, dosage, description, side_effects, drug_interactions,
       stock_quantity, unit_price, reorder_level, expiry_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;
  const result = await query(sql, [
    name, dosage || null, description || null,
    side_effects || null, drug_interactions || null,
    stock_quantity, unit_price, reorder_level || 100, expiry_date || null,
  ]);
  return result.rows[0];
};

const getMedications = async ({ page = 1, limit = 10, search = '', low_stock = false }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (low_stock === 'true' || low_stock === true) {
    conditions.push(`stock_quantity <= reorder_level`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = parseInt(
    (await query(`SELECT COUNT(*) FROM medications ${where}`, values)).rows[0].count, 10
  );

  const dataSql = `
    SELECT * FROM medications ${where}
    ORDER BY name ASC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);
  return { data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getMedicationById = async (id) => {
  const result = await query(`SELECT * FROM medications WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
};

const updateMedication = async (id, updates) => {
  const allowed = [
    'name', 'dosage', 'description', 'side_effects', 'drug_interactions',
    'stock_quantity', 'unit_price', 'reorder_level', 'expiry_date',
  ];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return getMedicationById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE medications SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const adjustStock = async (id, delta) => {
  const result = await query(
    `UPDATE medications SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 RETURNING *`,
    [delta, id]
  );
  return result.rows[0] || null;
};

const deleteMedication = async (id) => {
  const result = await query(`DELETE FROM medications WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
};

module.exports = {
  createMedication, getMedications, getMedicationById,
  updateMedication, adjustStock, deleteMedication,
};

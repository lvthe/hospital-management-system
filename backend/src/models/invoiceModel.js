const { query, pool } = require("../config/database");

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const result = await query(
    `SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1`,
    [`INV-${year}-%`]
  );
  const seq = parseInt(result.rows[0].count, 10) + 1;
  return `INV-${year}-${String(seq).padStart(4, '0')}`;
};

const createInvoice = async ({ patient_id, appointment_id, items, due_date }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const invoiceNumber = await generateInvoiceNumber();

    const invResult = await client.query(
      `INSERT INTO invoices (patient_id, appointment_id, invoice_number, invoice_date, total_amount, due_date)
       VALUES ($1,$2,$3,CURRENT_DATE,$4,$5) RETURNING *`,
      [patient_id, appointment_id || null, invoiceNumber, totalAmount, due_date || null]
    );
    const invoice = invResult.rows[0];

    for (const item of items) {
      const total_price = item.quantity * item.unit_price;
      await client.query(
        `INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [invoice.id, item.item_type, item.description || null, item.quantity, item.unit_price, total_price]
      );
    }

    await client.query('COMMIT');
    return getInvoiceById(invoice.id, client);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getInvoices = async ({ page = 1, limit = 10, patient_id = '', status = '' }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (patient_id) { conditions.push(`inv.patient_id = $${idx++}`); values.push(patient_id); }
  if (status)     { conditions.push(`inv.status = $${idx++}`);      values.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = parseInt(
    (await query(`SELECT COUNT(*) FROM invoices inv ${where}`, values)).rows[0].count, 10
  );

  const dataSql = `
    SELECT inv.*,
           u.full_name AS patient_name, u.email AS patient_email
    FROM invoices inv
    JOIN patients p ON inv.patient_id = p.id
    JOIN users    u ON p.user_id      = u.id
    ${where}
    ORDER BY inv.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(dataSql, [...values, limit, offset]);
  return { data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getInvoiceById = async (id, client = null) => {
  const exec = client ? client.query.bind(client) : query;
  const invResult = await exec(
    `SELECT inv.*, u.full_name AS patient_name, u.email AS patient_email
     FROM invoices inv
     JOIN patients p ON inv.patient_id = p.id
     JOIN users    u ON p.user_id      = u.id
     WHERE inv.id = $1 LIMIT 1`,
    [id]
  );
  if (!invResult.rows[0]) return null;

  const itemsResult = await exec(
    `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
    [id]
  );

  return { ...invResult.rows[0], items: itemsResult.rows };
};

const recordPayment = async (id, { amount_paid, payment_method }) => {
  const inv = await getInvoiceById(id);
  if (!inv) return null;

  const newPaid = parseFloat(inv.paid_amount) + parseFloat(amount_paid);
  const total   = parseFloat(inv.total_amount);
  const newStatus = newPaid >= total ? 'paid' : newPaid > 0 ? 'partially_paid' : inv.status;

  const result = await query(
    `UPDATE invoices
     SET paid_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [newPaid, newStatus, id]
  );
  return result.rows[0] || null;
};

const cancelInvoice = async (id) => {
  const result = await query(
    `UPDATE invoices SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

const getInvoicesByPatient = async (patientId) => {
  const result = await query(
    `SELECT * FROM invoices WHERE patient_id = $1 ORDER BY created_at DESC`,
    [patientId]
  );
  return result.rows;
};

module.exports = {
  createInvoice, getInvoices, getInvoiceById,
  recordPayment, cancelInvoice, getInvoicesByPatient,
};

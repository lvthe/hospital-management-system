const { query } = require("../config/database");

const getAppointmentReport = async ({ date_from, date_to, doctor_id }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (date_from) { conditions.push(`a.appointment_date >= $${idx++}`); values.push(date_from); }
  if (date_to)   { conditions.push(`a.appointment_date <= $${idx++}`); values.push(date_to); }
  if (doctor_id) { conditions.push(`a.doctor_id = $${idx++}`);         values.push(doctor_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const summaryResult = await query(
    `SELECT
       COUNT(*)                                                          AS total,
       COUNT(*) FILTER (WHERE status = 'completed')                     AS completed,
       COUNT(*) FILTER (WHERE status = 'cancelled')                     AS cancelled,
       COUNT(*) FILTER (WHERE status = 'no-show')                       AS no_show,
       COUNT(*) FILTER (WHERE status = 'scheduled')                     AS scheduled
     FROM appointments a ${where}`,
    values
  );

  const byDoctorResult = await query(
    `SELECT u.full_name AS doctor_name, d.specialist,
            COUNT(*)                                          AS total,
            COUNT(*) FILTER (WHERE a.status = 'completed')   AS completed
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users   u ON d.user_id   = u.id
     ${where}
     GROUP BY u.full_name, d.specialist
     ORDER BY total DESC`,
    values
  );

  const dailyTrendResult = await query(
    `SELECT appointment_date::DATE AS date, COUNT(*) AS total
     FROM appointments a ${where}
     GROUP BY appointment_date::DATE
     ORDER BY date ASC`,
    values
  );

  return {
    summary: summaryResult.rows[0],
    by_doctor: byDoctorResult.rows,
    daily_trend: dailyTrendResult.rows,
  };
};

const getRevenueReport = async ({ date_from, date_to }) => {
  const conditions = ['inv.status != $1'];
  const values = ['cancelled'];
  let idx = 2;

  if (date_from) { conditions.push(`inv.invoice_date >= $${idx++}`); values.push(date_from); }
  if (date_to)   { conditions.push(`inv.invoice_date <= $${idx++}`); values.push(date_to); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const summaryResult = await query(
    `SELECT
       COALESCE(SUM(total_amount), 0)  AS total_billed,
       COALESCE(SUM(paid_amount), 0)   AS total_collected,
       COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status != 'paid'), 0) AS outstanding,
       COUNT(*)                                                           AS total_invoices,
       COUNT(*) FILTER (WHERE status = 'paid')                           AS paid_count,
       COUNT(*) FILTER (WHERE status = 'pending')                        AS pending_count,
       COUNT(*) FILTER (WHERE status = 'overdue')                        AS overdue_count
     FROM invoices inv ${where}`,
    values
  );

  const monthlyResult = await query(
    `SELECT TO_CHAR(invoice_date, 'YYYY-MM') AS month,
            COALESCE(SUM(total_amount), 0)   AS billed,
            COALESCE(SUM(paid_amount), 0)    AS collected
     FROM invoices inv ${where}
     GROUP BY TO_CHAR(invoice_date, 'YYYY-MM')
     ORDER BY month ASC`,
    values
  );

  const byTypeResult = await query(
    `SELECT ii.item_type,
            COUNT(*)                        AS count,
            COALESCE(SUM(ii.total_price), 0) AS revenue
     FROM invoice_items ii
     JOIN invoices inv ON ii.invoice_id = inv.id
     ${where}
     GROUP BY ii.item_type
     ORDER BY revenue DESC`,
    values
  );

  return {
    summary: summaryResult.rows[0],
    monthly_trend: monthlyResult.rows,
    by_item_type: byTypeResult.rows,
  };
};

const getDashboardStats = async () => {
  const [patients, doctors, appointments, invoices] = await Promise.all([
    query(`SELECT COUNT(*) FROM patients`),
    query(`SELECT COUNT(*) FROM doctors`),
    query(`SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE`),
    query(`SELECT COALESCE(SUM(paid_amount), 0) AS today_revenue FROM invoices WHERE invoice_date = CURRENT_DATE AND status != 'cancelled'`),
  ]);

  const recentAppointments = await query(
    `SELECT a.id, a.appointment_date, a.appointment_time, a.status,
            pu.full_name AS patient_name, du.full_name AS doctor_name
     FROM appointments a
     JOIN patients p  ON a.patient_id = p.id
     JOIN users    pu ON p.user_id    = pu.id
     JOIN doctors  d  ON a.doctor_id  = d.id
     JOIN users    du ON d.user_id    = du.id
     ORDER BY a.created_at DESC LIMIT 5`
  );

  const lowStock = await query(
    `SELECT id, name, stock_quantity, reorder_level
     FROM medications
     WHERE stock_quantity <= reorder_level
     ORDER BY stock_quantity ASC LIMIT 5`
  );

  return {
    total_patients:    parseInt(patients.rows[0].count),
    total_doctors:     parseInt(doctors.rows[0].count),
    today_appointments: parseInt(appointments.rows[0].count),
    today_revenue:     parseFloat(invoices.rows[0].today_revenue),
    recent_appointments: recentAppointments.rows,
    low_stock_medications: lowStock.rows,
  };
};

module.exports = { getAppointmentReport, getRevenueReport, getDashboardStats };

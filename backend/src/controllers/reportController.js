const { getAppointmentReport, getRevenueReport, getDashboardStats } = require("../services/reportService");

const dashboard = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const appointments = async (req, res, next) => {
  try {
    const { date_from, date_to, doctor_id } = req.query;
    const data = await getAppointmentReport({ date_from, date_to, doctor_id });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const revenue = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const data = await getRevenueReport({ date_from, date_to });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { dashboard, appointments, revenue };

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, CircularProgress, Chip, Alert } from '@mui/material';
import { People, CalendarMonth, MedicalServices, TrendingUp, Medication, Warning } from '@mui/icons-material';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      <Box sx={{ bgcolor: `${color}15`, borderRadius: 2, p: 1.5 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
      </Box>
    </Box>
  </Paper>
);

const STATUS_COLORS = {
  scheduled: 'primary', completed: 'success', cancelled: 'error', 'in-progress': 'warning', 'no-show': 'default',
};
const STATUS_LABELS = {
  scheduled: 'Đã lên lịch', completed: 'Hoàn thành', cancelled: 'Đã hủy', 'in-progress': 'Đang khám', 'no-show': 'Không đến',
};

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try new /reports/dashboard endpoint first, fall back to individual calls
        const r = await api.get('/reports/dashboard').catch(() => null);
        if (r?.data?.data) {
          setStats(r.data.data);
        } else {
          const [apptRes, patientRes, doctorRes] = await Promise.allSettled([
            api.get('/appointments', { params: { limit: 5 } }),
            api.get('/patients',     { params: { limit: 1 } }),
            api.get('/doctors',      { params: { limit: 1 } }),
          ]);
          setStats({
            total_patients:     patientRes.status === 'fulfilled' ? patientRes.value.data.pagination?.total : '—',
            total_doctors:      doctorRes.status  === 'fulfilled' ? doctorRes.value.data.pagination?.total  : '—',
            today_appointments: '—',
            today_revenue:      0,
            recent_appointments: apptRes.status === 'fulfilled' ? apptRes.value.data.data : [],
            low_stock_medications: [],
          });
        }
      } catch (e) {
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Chào mừng, {user?.full_name}!
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng bệnh nhân" value={stats?.total_patients ?? '—'} icon={<People />} color="#1976d2" subtitle="Đã đăng ký" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Lịch hẹn hôm nay" value={stats?.today_appointments ?? '—'} icon={<CalendarMonth />} color="#7b1fa2" subtitle="Trong ngày" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Bác sĩ" value={stats?.total_doctors ?? '—'} icon={<MedicalServices />} color="#388e3c" subtitle="Đang công tác" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu hôm nay"
            value={stats?.today_revenue !== undefined ? `${Number(stats.today_revenue).toLocaleString('vi-VN')} ₫` : '—'}
            icon={<TrendingUp />}
            color="#f57c00"
            subtitle="Đã thu"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent appointments */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight={600}>Lịch hẹn gần đây</Typography>
            </Box>
            {!stats?.recent_appointments?.length ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Chưa có lịch hẹn nào</Typography>
              </Box>
            ) : (
              <Box>
                {stats.recent_appointments.map((appt) => (
                  <Box key={appt.id} sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{appt.patient_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dr. {appt.doctor_name} • {new Date(appt.appointment_date).toLocaleDateString('vi-VN')} {appt.appointment_time?.slice(0, 5)}
                      </Typography>
                    </Box>
                    <Chip label={STATUS_LABELS[appt.status] || appt.status} color={STATUS_COLORS[appt.status] || 'default'} size="small" />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Low stock */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={600}>Thuốc sắp hết</Typography>
            </Box>
            {!stats?.low_stock_medications?.length ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Kho thuốc đủ hàng</Typography>
              </Box>
            ) : (
              <Box>
                {stats.low_stock_medications.map((med) => (
                  <Box key={med.id} sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Medication sx={{ color: 'warning.main', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={500}>{med.name}</Typography>
                    </Box>
                    <Chip label={`${med.stock_quantity} / ${med.reorder_level}`} color="warning" size="small" variant="outlined" />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

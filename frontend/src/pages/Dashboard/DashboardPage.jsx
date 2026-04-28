import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, CircularProgress, Chip } from '@mui/material';
import { People, CalendarMonth, MedicalServices, TrendingUp } from '@mui/icons-material';
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
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'error',
  'in-progress': 'warning',
  'no-show': 'default',
};

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  'in-progress': 'Đang khám',
  'no-show': 'Không đến',
};

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, patientRes, doctorRes] = await Promise.allSettled([
          api.get('/appointments', { params: { limit: 5 } }),
          api.get('/patients', { params: { limit: 1 } }),
          api.get('/doctors', { params: { limit: 1 } }),
        ]);

        setRecentAppts(apptRes.status === 'fulfilled' ? apptRes.value.data.data : []);
        setStats({
          patients: patientRes.status === 'fulfilled' ? patientRes.value.data.pagination?.total : '—',
          appointments: apptRes.status === 'fulfilled' ? apptRes.value.data.pagination?.total : '—',
          doctors: doctorRes.status === 'fulfilled' ? doctorRes.value.data.pagination?.total : '—',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Chào mừng, {user?.full_name}!
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng bệnh nhân" value={stats?.patients ?? '—'} icon={<People />} color="#1976d2" subtitle="Đã đăng ký" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng lịch hẹn" value={stats?.appointments ?? '—'} icon={<CalendarMonth />} color="#7b1fa2" subtitle="Tất cả trạng thái" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Bác sĩ" value={stats?.doctors ?? '—'} icon={<MedicalServices />} color="#388e3c" subtitle="Đang công tác" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Doanh thu" value="—" icon={<TrendingUp />} color="#f57c00" subtitle="Tháng này" />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600}>Lịch hẹn gần đây</Typography>
        </Box>
        {recentAppts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Chưa có lịch hẹn nào</Typography>
          </Box>
        ) : (
          <Box>
            {recentAppts.map((appt) => (
              <Box key={appt.id} sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{appt.patient_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dr. {appt.doctor_name} • {appt.specialist} • {new Date(appt.appointment_date).toLocaleDateString('vi-VN')} {appt.appointment_time?.slice(0, 5)}
                  </Typography>
                </Box>
                <Chip
                  label={STATUS_LABELS[appt.status] || appt.status}
                  color={STATUS_COLORS[appt.status] || 'default'}
                  size="small"
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

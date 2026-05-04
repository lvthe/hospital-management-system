import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import {
  Person, CalendarMonth, MedicalInformation, Description, Receipt,
  Add, Cancel, EventAvailable,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const STATUS_COLORS = { scheduled: 'primary', completed: 'success', cancelled: 'error', 'in-progress': 'warning', 'no-show': 'default' };
const STATUS_LABELS = { scheduled: 'Đã lên lịch', completed: 'Hoàn thành', cancelled: 'Đã hủy', 'in-progress': 'Đang khám', 'no-show': 'Không đến' };
const INV_COLORS = { pending: 'warning', paid: 'success', partially_paid: 'info', overdue: 'error', cancelled: 'default' };
const INV_LABELS = { pending: 'Chờ TT', paid: 'Đã TT', partially_paid: 'Một phần', overdue: 'Quá hạn', cancelled: 'Đã hủy' };

// ── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ profile }) {
  if (!profile) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
  const fields = [
    ['Họ và tên', profile.full_name],
    ['Email', profile.email],
    ['Số điện thoại', profile.phone || '—'],
    ['Mã hồ sơ', profile.medical_record_number],
    ['Ngày sinh', profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : '—'],
    ['Giới tính', profile.gender === 'M' ? 'Nam' : profile.gender === 'F' ? 'Nữ' : profile.gender || '—'],
    ['Nhóm máu', profile.blood_type || '—'],
    ['Dị ứng', Array.isArray(profile.allergies) ? profile.allergies.join(', ') || '—' : '—'],
    ['Liên hệ khẩn', profile.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone})` : '—'],
    ['Bảo hiểm', profile.insurance_provider || '—'],
    ['Số BH', profile.insurance_policy_number || '—'],
  ];
  return (
    <Grid container spacing={2}>
      {fields.map(([label, value]) => (
        <Grid item xs={12} sm={6} key={label}>
          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
          <Typography variant="body2" fontWeight={500}>{value}</Typography>
        </Grid>
      ))}
    </Grid>
  );
}

// ── Appointments Tab ─────────────────────────────────────────────────────────
function AppointmentsTab({ patientId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', appointment_time: '', duration_minutes: 30, reason_for_visit: '' });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/appointments', { params: { limit: 50 } });
      setList(r.data.data || []);
    } catch { setError('Không tải được lịch hẹn'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    api.get('/doctors', { params: { limit: 100 } }).then(r => setDoctors(r.data.data || []));
  }, [load]);

  const handleBook = async () => {
    setFormError('');
    if (!form.doctor_id || !form.appointment_date || !form.appointment_time) {
      setFormError('Vui lòng điền đầy đủ thông tin'); return;
    }
    try {
      await api.post('/appointments', { ...form, patient_id: patientId });
      setBookOpen(false);
      setForm({ doctor_id: '', appointment_date: '', appointment_time: '', duration_minutes: 30, reason_for_visit: '' });
      load();
    } catch (e) { setFormError(e.response?.data?.message || 'Đặt lịch thất bại'); }
  };

  const handleCancel = async () => {
    try {
      await api.patch(`/appointments/${cancelId}/cancel`);
      setCancelId(null); load();
    } catch (e) { setError(e.response?.data?.message || 'Lỗi hủy lịch hẹn'); }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setBookOpen(true)}>Đặt lịch hẹn</Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell>Bác sĩ</TableCell>
            <TableCell>Ngày</TableCell>
            <TableCell>Giờ</TableCell>
            <TableCell>Lý do</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {list.length === 0
              ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có lịch hẹn</TableCell></TableRow>
              : list.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>Dr. {a.doctor_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.specialist}</Typography>
                  </TableCell>
                  <TableCell>{new Date(a.appointment_date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{a.appointment_time?.slice(0, 5)}</TableCell>
                  <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{a.reason_for_visit || '—'}</Typography></TableCell>
                  <TableCell><Chip label={STATUS_LABELS[a.status]} color={STATUS_COLORS[a.status]} size="small" /></TableCell>
                  <TableCell align="right">
                    {['scheduled', 'in-progress'].includes(a.status) && (
                      <Button size="small" color="error" startIcon={<Cancel />} onClick={() => setCancelId(a.id)}>Hủy</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Book Dialog */}
      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Chọn bác sĩ *" value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} size="small">
                {doctors.map(d => <MenuItem key={d.id} value={d.id}>Dr. {d.full_name} — {d.specialist}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Ngày hẹn *" type="date" value={form.appointment_date} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Giờ hẹn *" type="time" value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Lý do khám" value={form.reason_for_visit} onChange={e => setForm(f => ({ ...f, reason_for_visit: e.target.value }))} size="small" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBook}>Đặt lịch</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirm */}
      <Dialog open={!!cancelId} onClose={() => setCancelId(null)}>
        <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn hủy lịch hẹn này?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelId(null)}>Không</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Hủy lịch</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Medical Records Tab ──────────────────────────────────────────────────────
function RecordsTab({ patientId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/medical-records/patient/${patientId}`)
      .then(r => setList(r.data.data || []))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
      <Table size="small">
        <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
          <TableCell>Ngày</TableCell>
          <TableCell>Bác sĩ</TableCell>
          <TableCell>Chẩn đoán</TableCell>
          <TableCell>Kế hoạch điều trị</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {list.length === 0
            ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có hồ sơ y tế</TableCell></TableRow>
            : list.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{new Date(r.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>Dr. {r.doctor_name}</TableCell>
                <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{r.diagnosis || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{r.treatment_plan || '—'}</Typography></TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Prescriptions Tab ────────────────────────────────────────────────────────
function PrescriptionsTab({ patientId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/prescriptions/patient/${patientId}`)
      .then(r => setList(r.data.data || []))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
      <Table size="small">
        <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
          <TableCell>Ngày kê</TableCell>
          <TableCell>Bác sĩ</TableCell>
          <TableCell>Thuốc</TableCell>
          <TableCell>Liều / Tần suất</TableCell>
          <TableCell>Trạng thái</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {list.length === 0
            ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có đơn thuốc</TableCell></TableRow>
            : list.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{new Date(p.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>Dr. {p.doctor_name}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.medication_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.medication_dosage}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{p.dosage}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.frequency}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={p.dispensed_date ? 'Đã cấp phát' : 'Chờ cấp phát'} color={p.dispensed_date ? 'success' : 'warning'} size="small" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Invoices Tab ─────────────────────────────────────────────────────────────
function InvoicesTab({ patientId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/patient/${patientId}`)
      .then(r => setList(r.data.data || []))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
      <Table size="small">
        <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
          <TableCell>Số HĐ</TableCell>
          <TableCell>Ngày</TableCell>
          <TableCell align="right">Tổng tiền (₫)</TableCell>
          <TableCell align="right">Đã trả (₫)</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Hạn TT</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {list.length === 0
            ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có hóa đơn</TableCell></TableRow>
            : list.map(inv => (
              <TableRow key={inv.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{inv.invoice_number}</Typography></TableCell>
                <TableCell>{new Date(inv.invoice_date).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell align="right">{Number(inv.total_amount).toLocaleString('vi-VN')}</TableCell>
                <TableCell align="right">{Number(inv.paid_amount).toLocaleString('vi-VN')}</TableCell>
                <TableCell><Chip label={INV_LABELS[inv.status]} color={INV_COLORS[inv.status]} size="small" /></TableCell>
                <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('vi-VN') : '—'}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Thông tin cá nhân', icon: <Person /> },
  { label: 'Lịch hẹn',          icon: <CalendarMonth /> },
  { label: 'Hồ sơ y tế',        icon: <MedicalInformation /> },
  { label: 'Đơn thuốc',         icon: <Description /> },
  { label: 'Hóa đơn',           icon: <Receipt /> },
];

export default function PatientPortalPage() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then(r => setProfile(r.data.data))
      .catch(() => setProfileError('Không thể tải thông tin hồ sơ bệnh nhân. Tài khoản chưa được liên kết với hồ sơ.'));
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Cổng thông tin bệnh nhân</Typography>
        <Typography variant="body2" color="text.secondary">Xin chào, {user?.full_name}!</Typography>
      </Box>

      {profileError && <Alert severity="warning" sx={{ mb: 2 }}>{profileError}</Alert>}

      {profile && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 2, p: 2, bgcolor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[
              ['Mã hồ sơ', profile.medical_record_number],
              ['Nhóm máu', profile.blood_type || '—'],
              ['Dị ứng', Array.isArray(profile.allergies) && profile.allergies.length ? profile.allergies.join(', ') : 'Không có'],
            ].map(([k, v]) => (
              <Box key={k}>
                <Typography variant="caption" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: '1px solid #e0e0e0', px: 1 }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 48, fontSize: 13 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && <ProfileTab profile={profile} />}
          {tab === 1 && profile && <AppointmentsTab patientId={profile.id} />}
          {tab === 2 && profile && <RecordsTab patientId={profile.id} />}
          {tab === 3 && profile && <PrescriptionsTab patientId={profile.id} />}
          {tab === 4 && profile && <InvoicesTab patientId={profile.id} />}
          {!profile && tab !== 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography>Cần có hồ sơ bệnh nhân để xem dữ liệu này</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Alert, TextField, InputAdornment,
} from '@mui/material';
import { Add, Cancel, Refresh, CheckCircle, Update } from '@mui/icons-material';
import { fetchAppointments, createAppointment, cancelAppointment, updateAppointmentStatus } from '../../store/slices/appointmentSlice';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const STATUS_COLORS = { scheduled: 'primary', completed: 'success', cancelled: 'error', 'in-progress': 'warning', 'no-show': 'default' };
const STATUS_LABELS = { scheduled: 'Đã lên lịch', completed: 'Hoàn thành', cancelled: 'Đã hủy', 'in-progress': 'Đang khám', 'no-show': 'Không đến' };
const STATUSES = Object.entries(STATUS_LABELS);
const UPDATE_STATUSES = ['in-progress', 'completed', 'no-show'];

const EMPTY_FORM = { patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', duration_minutes: 30, reason_for_visit: '' };

export default function AppointmentsPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.appointments);
  const { can } = usePermissions();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null); // { id, current }
  const [newStatus, setNewStatus] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const load = (p = page, s = statusFilter) => {
    dispatch(fetchAppointments({ page: p, limit: 10, status: s }));
  };

  useEffect(() => { load(); }, []);

  const openCreate = async () => {
    setForm(EMPTY_FORM);
    setFormError('');
    try {
      const [pRes, dRes] = await Promise.all([
        api.get('/patients', { params: { limit: 100 } }),
        api.get('/doctors', { params: { limit: 100 } }),
      ]);
      setPatients(pRes.data.data);
      setDoctors(dRes.data.data);
    } catch {}
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    const result = await dispatch(createAppointment(form));
    if (result.error) setFormError(result.payload || 'Có lỗi xảy ra');
    else { setDialogOpen(false); load(); }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    await dispatch(cancelAppointment(cancelId));
    setCancelId(null);
    load();
  };

  const openStatusDialog = (appt) => {
    setStatusDialog({ id: appt.id, current: appt.status });
    setNewStatus(appt.status);
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog || !newStatus) return;
    await dispatch(updateAppointmentStatus({ id: statusDialog.id, status: newStatus }));
    setStatusDialog(null);
    load();
  };

  const canCancel = (appt) => appt.status !== 'cancelled' && appt.status !== 'completed';
  const canUpdateStatus = (appt) => appt.status !== 'cancelled' && appt.status !== 'completed';

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select size="small" label="Trạng thái" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, e.target.value); }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {STATUSES.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load()}>Làm mới</Button>
        <Box sx={{ flexGrow: 1 }} />
        {can('appointments.create') && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Đặt lịch hẹn</Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Bệnh nhân</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bác sĩ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Giờ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có lịch hẹn nào</TableCell></TableRow>
              ) : list.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{a.patient_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.patient_email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{a.doctor_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.specialist}</Typography>
                  </TableCell>
                  <TableCell>{new Date(a.appointment_date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{a.appointment_time?.slice(0, 5)}</TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography variant="body2" noWrap title={a.reason_for_visit}>{a.reason_for_visit || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABELS[a.status]} color={STATUS_COLORS[a.status]} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {can('appointments.updateStatus') && canUpdateStatus(a) && (
                      <IconButton size="small" color="primary" onClick={() => openStatusDialog(a)} title="Cập nhật trạng thái">
                        <Update fontSize="small" />
                      </IconButton>
                    )}
                    {can('appointments.cancel') && canCancel(a) && (
                      <IconButton size="small" color="error" onClick={() => setCancelId(a.id)} title="Hủy lịch">
                        <Cancel fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination?.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => { setPage(v); load(v); }} color="primary" />
          </Box>
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth select label="Bệnh nhân *" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name} - {p.medical_record_number}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Bác sĩ *" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
                {doctors.map((d) => <MenuItem key={d.id} value={d.id}>{d.full_name} - {d.specialist}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Ngày hẹn *" type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giờ hẹn *" type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Thời lượng (phút)" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} inputProps={{ min: 15, max: 120, step: 15 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Lý do khám" value={form.reason_for_visit} onChange={(e) => setForm({ ...form, reason_for_visit: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Đặt lịch</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusDialog} onClose={() => setStatusDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cập nhật trạng thái lịch hẹn</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth select label="Trạng thái mới" value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {UPDATE_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(null)}>Hủy</Button>
          <Button variant="contained" startIcon={<CheckCircle />} onClick={handleStatusUpdate}>Cập nhật</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirm */}
      <Dialog open={!!cancelId} onClose={() => setCancelId(null)}>
        <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn hủy lịch hẹn này không?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelId(null)}>Không</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Hủy lịch</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

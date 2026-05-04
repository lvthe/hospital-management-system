import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Alert, InputAdornment, Chip,
} from '@mui/material';
import { Add, Search, Edit, Delete, Refresh, Visibility } from '@mui/icons-material';
import {
  fetchMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
} from '../../store/slices/medicalRecordSlice';
import api from '../../services/api';

const EMPTY_FORM = {
  patient_id: '', doctor_id: '', appointment_id: '',
  diagnosis: '', symptoms: '', treatment_plan: '', notes: '',
  vital_signs: { blood_pressure: '', heart_rate: '', temperature: '', weight: '' },
};

export default function MedicalRecordsPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.medicalRecords);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const load = (p = page) => dispatch(fetchMedicalRecords({ page: p, limit: 10 }));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data || []));
    api.get('/doctors',  { params: { limit: 100 } }).then(r => setDoctors(r.data.data || []));
  }, []);

  const openCreate = () => {
    setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true);
  };

  const openEdit = (rec) => {
    setEditingId(rec.id);
    setForm({
      patient_id: rec.patient_id || '', doctor_id: rec.doctor_id || '',
      appointment_id: rec.appointment_id || '',
      diagnosis: rec.diagnosis || '', symptoms: Array.isArray(rec.symptoms) ? rec.symptoms.join(', ') : (rec.symptoms || ''),
      treatment_plan: rec.treatment_plan || '', notes: rec.notes || '',
      vital_signs: rec.vital_signs || { blood_pressure: '', heart_rate: '', temperature: '', weight: '' },
    });
    setFormError(''); setDialogOpen(true);
  };

  const openView = (rec) => { setViewRecord(rec); setViewOpen(true); };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setVital = (k, v) => setForm(f => ({ ...f, vital_signs: { ...f.vital_signs, [k]: v } }));

  const handleSubmit = async () => {
    setFormError('');
    if (!form.patient_id || !form.doctor_id) { setFormError('Bệnh nhân và bác sĩ là bắt buộc'); return; }
    const payload = {
      ...form,
      symptoms: form.symptoms ? form.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
      appointment_id: form.appointment_id || undefined,
    };
    const result = editingId
      ? await dispatch(updateMedicalRecord({ id: editingId, ...payload }))
      : await dispatch(createMedicalRecord(payload));
    if (result.error) { setFormError(result.payload || 'Có lỗi xảy ra'); }
    else { setDialogOpen(false); load(); }
  };

  const handleDelete = async () => {
    await dispatch(deleteMedicalRecord(deleteId));
    setDeleteId(null); load();
  };

  const canWrite = ['admin', 'doctor'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Hồ sơ y tế</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý kết quả khám bệnh</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Tạo hồ sơ</Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Tìm theo bệnh nhân..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ width: 280 }} />
          <Button variant="outlined" size="small" onClick={() => load(1)}><Search /></Button>
          <Button variant="outlined" size="small" onClick={() => { setSearch(''); setPage(1); dispatch(fetchMedicalRecords({ page: 1, limit: 10 })); }}><Refresh /></Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell fontWeight={600}>Bệnh nhân</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Chẩn đoán</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có hồ sơ y tế</TableCell></TableRow>
                ) : list.map((rec) => (
                  <TableRow key={rec.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{rec.patient_name}</Typography>
                      {rec.medical_record_number && <Typography variant="caption" color="text.secondary">{rec.medical_record_number}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rec.doctor_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{rec.doctor_specialist}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{rec.diagnosis || '—'}</Typography>
                    </TableCell>
                    <TableCell>{new Date(rec.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openView(rec)}><Visibility fontSize="small" /></IconButton>
                      {canWrite && <IconButton size="small" onClick={() => openEdit(rec)}><Edit fontSize="small" /></IconButton>}
                      {canDelete && <IconButton size="small" color="error" onClick={() => setDeleteId(rec.id)}><Delete fontSize="small" /></IconButton>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {pagination?.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => { setPage(v); load(v); }} />
          </Box>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Cập nhật hồ sơ y tế' : 'Tạo hồ sơ y tế mới'}</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            {!editingId && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Bệnh nhân *" value={form.patient_id} onChange={e => setField('patient_id', e.target.value)} SelectProps={{ native: true }} size="small">
                    <option value="">-- Chọn bệnh nhân --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.medical_record_number})</option>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Bác sĩ *" value={form.doctor_id} onChange={e => setField('doctor_id', e.target.value)} SelectProps={{ native: true }} size="small">
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.full_name} - {d.specialist}</option>)}
                  </TextField>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Chẩn đoán" value={form.diagnosis} onChange={e => setField('diagnosis', e.target.value)} size="small" multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Triệu chứng (cách nhau bằng dấu phẩy)" value={form.symptoms} onChange={e => setField('symptoms', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Huyết áp" value={form.vital_signs.blood_pressure} onChange={e => setVital('blood_pressure', e.target.value)} size="small" placeholder="120/80" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Nhịp tim (bpm)" value={form.vital_signs.heart_rate} onChange={e => setVital('heart_rate', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Nhiệt độ (°C)" value={form.vital_signs.temperature} onChange={e => setVital('temperature', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Cân nặng (kg)" value={form.vital_signs.weight} onChange={e => setVital('weight', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Kế hoạch điều trị" value={form.treatment_plan} onChange={e => setField('treatment_plan', e.target.value)} size="small" multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Ghi chú" value={form.notes} onChange={e => setField('notes', e.target.value)} size="small" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Lưu' : 'Tạo'}</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết hồ sơ y tế</DialogTitle>
        <DialogContent dividers>
          {viewRecord && (
            <Grid container spacing={1.5}>
              {[
                ['Bệnh nhân', viewRecord.patient_name],
                ['Bác sĩ', `${viewRecord.doctor_name} - ${viewRecord.doctor_specialist}`],
                ['Chẩn đoán', viewRecord.diagnosis || '—'],
                ['Triệu chứng', Array.isArray(viewRecord.symptoms) ? viewRecord.symptoms.join(', ') : viewRecord.symptoms || '—'],
                ['Huyết áp', viewRecord.vital_signs?.blood_pressure || '—'],
                ['Nhịp tim', viewRecord.vital_signs?.heart_rate ? `${viewRecord.vital_signs.heart_rate} bpm` : '—'],
                ['Nhiệt độ', viewRecord.vital_signs?.temperature ? `${viewRecord.vital_signs.temperature} °C` : '—'],
                ['Cân nặng', viewRecord.vital_signs?.weight ? `${viewRecord.vital_signs.weight} kg` : '—'],
                ['Kế hoạch điều trị', viewRecord.treatment_plan || '—'],
                ['Ghi chú', viewRecord.notes || '—'],
                ['Ngày tạo', new Date(viewRecord.created_at).toLocaleString('vi-VN')],
              ].map(([label, value]) => (
                <Grid item xs={12} key={label}>
                  <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                  <Typography variant="body2">{value}</Typography>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa hồ sơ y tế này?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Alert, InputAdornment,
} from '@mui/material';
import { Add, Search, Delete, Refresh, CheckCircle } from '@mui/icons-material';
import {
  fetchPrescriptionsByPatient, createPrescription, dispensePrescription, deletePrescription,
} from '../../store/slices/prescriptionSlice';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const EMPTY_FORM = {
  medical_record_id: '', medication_id: '',
  dosage: '', frequency: '', duration_days: '', instructions: '',
};

export default function PrescriptionsPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.prescriptions);
  const { can } = usePermissions();

  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [records, setRecords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data || []));
    api.get('/medications', { params: { limit: 100 } }).then(r => setMedications(r.data.data || []));
  }, []);

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    dispatch(fetchPrescriptionsByPatient(patient.id));
    const r = await api.get('/medical-records', { params: { patient_id: patient.id, limit: 50 } });
    setRecords(r.data.data || []);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    if (!selectedPatient) return;
    setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.medical_record_id || !form.medication_id || !form.dosage || !form.frequency) {
      setFormError('Hồ sơ, thuốc, liều lượng và tần suất là bắt buộc'); return;
    }
    const result = await dispatch(createPrescription({
      ...form,
      duration_days: form.duration_days ? parseInt(form.duration_days) : undefined,
    }));
    if (result.error) setFormError(result.payload || 'Có lỗi xảy ra');
    else setDialogOpen(false);
  };

  const handleDispense = async (id) => {
    await dispatch(dispensePrescription(id));
  };

  const handleDelete = async () => {
    await dispatch(deletePrescription(deleteId));
    setDeleteId(null);
  };

  const canWrite = can('prescriptions.create');
  const canDispense = can('prescriptions.dispense');

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.medical_record_number?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Đơn thuốc</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý kê đơn và cấp phát thuốc</Typography>
        </Box>
        {canWrite && selectedPatient && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Tạo đơn thuốc</Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {/* Patient selector */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Chọn bệnh nhân</Typography>
            <TextField fullWidth size="small" placeholder="Tìm bệnh nhân..." value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              sx={{ mb: 1 }} />
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredPatients.map(p => (
                <Box key={p.id} onClick={() => handleSelectPatient(p)}
                  sx={{
                    p: 1.5, borderRadius: 1, cursor: 'pointer', mb: 0.5,
                    bgcolor: selectedPatient?.id === p.id ? 'primary.light' : 'transparent',
                    color: selectedPatient?.id === p.id ? 'white' : 'inherit',
                    '&:hover': { bgcolor: selectedPatient?.id === p.id ? 'primary.light' : '#f5f5f5' },
                  }}>
                  <Typography variant="body2" fontWeight={600}>{p.full_name}</Typography>
                  <Typography variant="caption">{p.medical_record_number}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Prescription list */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {selectedPatient ? `Đơn thuốc của: ${selectedPatient.full_name}` : 'Chọn bệnh nhân để xem đơn thuốc'}
              </Typography>
              {selectedPatient && (
                <IconButton size="small" onClick={() => dispatch(fetchPrescriptionsByPatient(selectedPatient.id))}><Refresh /></IconButton>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : !selectedPatient ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>Vui lòng chọn bệnh nhân từ danh sách bên trái</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Thuốc</TableCell>
                      <TableCell>Liều / Tần suất</TableCell>
                      <TableCell>Số ngày</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có đơn thuốc</TableCell></TableRow>
                    ) : list.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{p.medication_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.medication_dosage}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{p.dosage}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.frequency}</Typography>
                        </TableCell>
                        <TableCell>{p.duration_days ? `${p.duration_days} ngày` : '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={p.dispensed_date ? 'Đã cấp phát' : 'Chờ cấp phát'}
                            color={p.dispensed_date ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {canDispense && !p.dispensed_date && (
                            <IconButton size="small" color="success" title="Cấp phát" onClick={() => handleDispense(p.id)}>
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}
                          {can('prescriptions.delete') && (
                            <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo đơn thuốc mới</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Hồ sơ y tế *" value={form.medical_record_id} onChange={e => setField('medical_record_id', e.target.value)} SelectProps={{ native: true }} size="small">
                <option value="">-- Chọn hồ sơ --</option>
                {records.map(r => <option key={r.id} value={r.id}>{new Date(r.created_at).toLocaleDateString('vi-VN')} — {r.diagnosis || 'Không có chẩn đoán'}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Thuốc *" value={form.medication_id} onChange={e => setField('medication_id', e.target.value)} SelectProps={{ native: true }} size="small">
                <option value="">-- Chọn thuốc --</option>
                {medications.map(m => <option key={m.id} value={m.id}>{m.name} {m.dosage} (tồn: {m.stock_quantity})</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Liều lượng *" value={form.dosage} onChange={e => setField('dosage', e.target.value)} size="small" placeholder="1 viên" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tần suất *" value={form.frequency} onChange={e => setField('frequency', e.target.value)} size="small" placeholder="3 lần/ngày" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Số ngày" value={form.duration_days} onChange={e => setField('duration_days', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Hướng dẫn" value={form.instructions} onChange={e => setField('instructions', e.target.value)} size="small" multiline rows={2} placeholder="Uống sau ăn..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Tạo đơn</Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa đơn thuốc này?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

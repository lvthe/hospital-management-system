import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Alert, InputAdornment,
} from '@mui/material';
import { Add, Search, Edit, Delete, Refresh } from '@mui/icons-material';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../../store/slices/patientSlice';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const GENDERS = [{ value: 'M', label: 'Nam' }, { value: 'F', label: 'Nữ' }, { value: 'Other', label: 'Khác' }];

const EMPTY_FORM = {
  email: '', password: '', full_name: '', phone: '',
  date_of_birth: '', gender: '', blood_type: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  insurance_provider: '', insurance_policy_number: '',
};

export default function PatientsPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.patients);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const load = (p = page, q = search) => {
    dispatch(fetchPatients({ page: p, limit: 10, search: q }));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => { setPage(1); load(1, search); };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      email: patient.email || '',
      password: '',
      full_name: patient.full_name || '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender || '',
      blood_type: patient.blood_type || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      insurance_provider: patient.insurance_provider || '',
      insurance_policy_number: patient.insurance_policy_number || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    let result;
    if (editingId) {
      const { email, password, full_name, phone, ...patientData } = form;
      result = await dispatch(updatePatient({ id: editingId, ...patientData }));
    } else {
      result = await dispatch(createPatient(form));
    }
    if (result.error) {
      setFormError(result.payload || 'Có lỗi xảy ra');
    } else {
      setDialogOpen(false);
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deletePatient(deleteId));
    setDeleteId(null);
    load();
  };

  return (
    <Box>
      {/* Actions bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Tìm kiếm bệnh nhân..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={handleSearch}>Tìm</Button>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load()}>Làm mới</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Thêm bệnh nhân</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mã hồ sơ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Giới tính</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nhóm máu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
              ) : list.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{p.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.phone}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{p.medical_record_number}</Typography></TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.gender === 'M' ? 'Nam' : p.gender === 'F' ? 'Nữ' : p.gender || '—'}</TableCell>
                  <TableCell>{p.blood_type ? <Chip label={p.blood_type} size="small" color="error" variant="outlined" /> : '—'}</TableCell>
                  <TableCell>
                    <Chip label={p.is_active ? 'Hoạt động' : 'Khóa'} color={p.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(p)} color="primary"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(p.id)} color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => { setPage(v); load(v); }} color="primary" />
          </Box>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            {!editingId && <>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Họ và tên *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Mật khẩu *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helperText="Tối thiểu 8 ký tự" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Grid>
            </>}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Ngày sinh" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Giới tính" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <MenuItem value="">Chọn giới tính</MenuItem>
                {GENDERS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Nhóm máu" value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })}>
                <MenuItem value="">Chọn nhóm máu</MenuItem>
                {BLOOD_TYPES.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Liên hệ khẩn cấp (tên)" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Liên hệ khẩn cấp (SĐT)" value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nhà bảo hiểm" value={form.insurance_provider} onChange={(e) => setForm({ ...form, insurance_provider: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Số hợp đồng bảo hiểm" value={form.insurance_policy_number} onChange={(e) => setForm({ ...form, insurance_policy_number: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Lưu thay đổi' : 'Tạo bệnh nhân'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa bệnh nhân này không?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

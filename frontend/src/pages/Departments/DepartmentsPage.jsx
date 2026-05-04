import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Alert, InputAdornment,
} from '@mui/material';
import { Add, Search, Edit, Delete, Refresh } from '@mui/icons-material';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../store/slices/departmentSlice';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const EMPTY_FORM = { name: '', code: '', leader_id: '', phone: '', location: '', floor: '' };

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.departments);
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');
  const [doctors, setDoctors] = useState([]);

  const load = (p = page, q = search) => dispatch(fetchDepartments({ page: p, limit: 20, search: q }));

  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get('/doctors', { params: { limit: 100 } }).then(r => setDoctors(r.data.data || []));
  }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true); };

  const openEdit = (dept) => {
    setEditingId(dept.id);
    setForm({ name: dept.name || '', code: dept.code || '', leader_id: dept.leader_id || '', phone: dept.phone || '', location: dept.location || '', floor: dept.floor ?? '' });
    setFormError(''); setDialogOpen(true);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setFormError('');
    if (!form.name || !form.code) { setFormError('Tên và mã phòng ban là bắt buộc'); return; }
    const payload = { ...form, floor: form.floor ? parseInt(form.floor) : undefined, leader_id: form.leader_id || undefined };
    const result = editingId
      ? await dispatch(updateDepartment({ id: editingId, ...payload }))
      : await dispatch(createDepartment(payload));
    if (result.error) setFormError(result.payload || 'Có lỗi xảy ra');
    else { setDialogOpen(false); load(); }
  };

  const handleDelete = async () => {
    await dispatch(deleteDepartment(deleteId));
    setDeleteId(null); load();
  };

  const isAdmin = can('departments.create');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Phòng ban / Khoa</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý cơ cấu tổ chức bệnh viện</Typography>
        </Box>
        {isAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Thêm phòng ban</Button>}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Tìm phòng ban..." value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setPage(1), load(1, search))}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ width: 280 }} />
          <Button variant="outlined" size="small" onClick={() => { setPage(1); load(1, search); }}><Search /></Button>
          <Button variant="outlined" size="small" onClick={() => { setSearch(''); setPage(1); dispatch(fetchDepartments({ page: 1, limit: 20 })); }}><Refresh /></Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Tên phòng ban</TableCell>
                  <TableCell>Mã</TableCell>
                  <TableCell>Trưởng khoa</TableCell>
                  <TableCell>Vị trí</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  {isAdmin && <TableCell align="right">Thao tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có phòng ban nào</TableCell></TableRow>
                ) : list.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{dept.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="primary">{dept.code}</Typography></TableCell>
                    <TableCell>{dept.leader_name ? `Dr. ${dept.leader_name}` : '—'}</TableCell>
                    <TableCell>{dept.location ? `${dept.location}${dept.floor ? `, Tầng ${dept.floor}` : ''}` : '—'}</TableCell>
                    <TableCell>{dept.phone || '—'}</TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(dept)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(dept.id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    )}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Cập nhật phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Tên phòng ban *" value={form.name} onChange={e => setField('name', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Mã *" value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} size="small" placeholder="TM, NK..." />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Trưởng khoa" value={form.leader_id} onChange={e => setField('leader_id', e.target.value)} SelectProps={{ native: true }} size="small">
                <option value="">-- Không có --</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.full_name} - {d.specialist}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Địa điểm" value={form.location} onChange={e => setField('location', e.target.value)} size="small" placeholder="Tòa nhà A..." />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Tầng" value={form.floor} onChange={e => setField('floor', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Số điện thoại" value={form.phone} onChange={e => setField('phone', e.target.value)} size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Lưu' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa phòng ban</DialogTitle>
        <DialogContent><Typography>Bạn có chắc muốn xóa phòng ban này?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Alert, InputAdornment, FormControlLabel, Checkbox,
} from '@mui/material';
import { Add, Search, Edit, Delete, Refresh, AddCircle, RemoveCircle, Warning } from '@mui/icons-material';
import {
  fetchMedications, createMedication, updateMedication, adjustMedicationStock, deleteMedication,
} from '../../store/slices/medicationSlice';
import { usePermissions } from '../../hooks/usePermissions';

const EMPTY_FORM = {
  name: '', dosage: '', description: '', unit_price: '', stock_quantity: '', reorder_level: '100', expiry_date: '',
};

export default function MedicationsPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.medications);
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialog, setStockDialog] = useState(null);
  const [stockDelta, setStockDelta] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');

  const load = (p = page, q = search, ls = lowStock) =>
    dispatch(fetchMedications({ page: p, limit: 10, search: q, low_stock: ls }));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true); };

  const openEdit = (med) => {
    setEditingId(med.id);
    setForm({
      name: med.name || '', dosage: med.dosage || '', description: med.description || '',
      unit_price: med.unit_price || '', stock_quantity: med.stock_quantity ?? '',
      reorder_level: med.reorder_level ?? '100',
      expiry_date: med.expiry_date ? med.expiry_date.split('T')[0] : '',
    });
    setFormError(''); setDialogOpen(true);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setFormError('');
    if (!form.name) { setFormError('Tên thuốc là bắt buộc'); return; }
    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity),
      reorder_level: parseInt(form.reorder_level),
      expiry_date: form.expiry_date || undefined,
    };
    const result = editingId
      ? await dispatch(updateMedication({ id: editingId, ...payload }))
      : await dispatch(createMedication(payload));
    if (result.error) setFormError(result.payload || 'Có lỗi xảy ra');
    else { setDialogOpen(false); load(); }
  };

  const handleStockAdjust = async () => {
    if (!stockDelta) return;
    await dispatch(adjustMedicationStock({ id: stockDialog.id, delta: parseInt(stockDelta) }));
    setStockDialog(null); setStockDelta('');
  };

  const handleDelete = async () => {
    await dispatch(deleteMedication(deleteId));
    setDeleteId(null); load();
  };

  const isAdmin = can('medications.create');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Quản lý thuốc</Typography>
          <Typography variant="body2" color="text.secondary">Kho thuốc và tồn kho</Typography>
        </Box>
        {isAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Thêm thuốc</Button>}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Tìm tên thuốc..." value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setPage(1), load(1, search, lowStock))}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ width: 260 }} />
          <Button variant="outlined" size="small" onClick={() => { setPage(1); load(1, search, lowStock); }}><Search /></Button>
          <FormControlLabel
            control={<Checkbox checked={lowStock} onChange={e => { setLowStock(e.target.checked); setPage(1); load(1, search, e.target.checked); }} size="small" />}
            label={<Typography variant="body2" color="warning.main">Sắp hết hàng</Typography>}
          />
          <Button variant="outlined" size="small" onClick={() => { setSearch(''); setLowStock(false); setPage(1); dispatch(fetchMedications({ page: 1, limit: 10 })); }}><Refresh /></Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell>Liều lượng</TableCell>
                  <TableCell align="right">Tồn kho</TableCell>
                  <TableCell align="right">Đơn giá (₫)</TableCell>
                  <TableCell>Hạn dùng</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có thuốc nào</TableCell></TableRow>
                ) : list.map((med) => {
                  const isLow = med.stock_quantity <= med.reorder_level;
                  return (
                    <TableRow key={med.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {isLow && <Warning sx={{ color: 'warning.main', fontSize: 16 }} />}
                          <Typography variant="body2" fontWeight={600}>{med.name}</Typography>
                        </Box>
                        {med.description && <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>{med.description}</Typography>}
                      </TableCell>
                      <TableCell>{med.dosage || '—'}</TableCell>
                      <TableCell align="right">
                        <Chip label={med.stock_quantity} size="small" color={isLow ? 'warning' : 'success'} variant="outlined" />
                        <Typography variant="caption" color="text.secondary" display="block">min: {med.reorder_level}</Typography>
                      </TableCell>
                      <TableCell align="right">{Number(med.unit_price).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>{med.expiry_date ? new Date(med.expiry_date).toLocaleDateString('vi-VN') : '—'}</TableCell>
                      <TableCell align="right">
                        {can('medications.stock') && (
                          <IconButton size="small" color="success" title="Nhập/xuất kho" onClick={() => { setStockDialog(med); setStockDelta(''); }}>
                            <AddCircle fontSize="small" />
                          </IconButton>
                        )}
                        {isAdmin && <IconButton size="small" onClick={() => openEdit(med)}><Edit fontSize="small" /></IconButton>}
                        {isAdmin && <IconButton size="small" color="error" onClick={() => setDeleteId(med.id)}><Delete fontSize="small" /></IconButton>}
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      {/* Create/Edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Tên thuốc *" value={form.name} onChange={e => setField('name', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Liều lượng" value={form.dosage} onChange={e => setField('dosage', e.target.value)} size="small" placeholder="500mg" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mô tả" value={form.description} onChange={e => setField('description', e.target.value)} size="small" multiline rows={2} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Đơn giá (₫) *" value={form.unit_price} onChange={e => setField('unit_price', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Số lượng tồn kho *" value={form.stock_quantity} onChange={e => setField('stock_quantity', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Mức cảnh báo" value={form.reorder_level} onChange={e => setField('reorder_level', e.target.value)} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hạn sử dụng" value={form.expiry_date} onChange={e => setField('expiry_date', e.target.value)} size="small" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Lưu' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjust */}
      <Dialog open={!!stockDialog} onClose={() => setStockDialog(null)}>
        <DialogTitle>Điều chỉnh tồn kho — {stockDialog?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>Tồn kho hiện tại: <strong>{stockDialog?.stock_quantity}</strong></Typography>
          <TextField fullWidth label="Số lượng (dương = nhập, âm = xuất)" value={stockDelta} onChange={e => setStockDelta(e.target.value)} type="number" size="small" autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialog(null)}>Hủy</Button>
          <Button variant="contained" onClick={handleStockAdjust}>Xác nhận</Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa thuốc</DialogTitle>
        <DialogContent><Typography>Hành động này không thể hoàn tác.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

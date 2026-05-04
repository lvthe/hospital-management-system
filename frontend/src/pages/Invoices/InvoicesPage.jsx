import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Pagination, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Alert, InputAdornment, MenuItem, Divider,
} from '@mui/material';
import { Add, Search, Refresh, Payment, Cancel, Visibility, AddCircle, RemoveCircle } from '@mui/icons-material';
import { fetchInvoices, createInvoice, payInvoice, cancelInvoice } from '../../store/slices/invoiceSlice';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const STATUS_COLORS = { pending: 'warning', paid: 'success', partially_paid: 'info', overdue: 'error', cancelled: 'default' };
const STATUS_LABELS = { pending: 'Chưa thanh toán', paid: 'Đã thanh toán', partially_paid: 'Thanh toán một phần', overdue: 'Quá hạn', cancelled: 'Đã hủy' };
const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_transfer', 'insurance'];
const PAYMENT_METHOD_LABELS = { cash: 'Tiền mặt', credit_card: 'Thẻ tín dụng', bank_transfer: 'Chuyển khoản', insurance: 'Bảo hiểm' };
const ITEM_TYPES = ['consultation', 'medication', 'test', 'equipment'];
const ITEM_TYPE_LABELS = { consultation: 'Khám bệnh', medication: 'Thuốc', test: 'Xét nghiệm', equipment: 'Thiết bị' };

const EMPTY_ITEM = { item_type: 'consultation', description: '', quantity: 1, unit_price: '' };

export default function InvoicesPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((s) => s.invoices);
  const { can } = usePermissions();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(null);
  const [viewOpen, setViewOpen] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formError, setFormError] = useState('');

  const [newInvoice, setNewInvoice] = useState({ patient_id: '', appointment_id: '', due_date: '', items: [{ ...EMPTY_ITEM }] });
  const [payForm, setPayForm] = useState({ amount_paid: '', payment_method: 'cash' });

  const load = (p = page, s = statusFilter) => dispatch(fetchInvoices({ page: p, limit: 10, status: s }));

  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data || []));
  }, []);

  const addItem = () => setNewInvoice(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setNewInvoice(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setItem = (i, k, v) => setNewInvoice(f => ({
    ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item),
  }));

  const totalAmount = newInvoice.items.reduce((s, it) => s + (parseFloat(it.unit_price) || 0) * (parseInt(it.quantity) || 0), 0);

  const handleCreate = async () => {
    setFormError('');
    if (!newInvoice.patient_id) { setFormError('Vui lòng chọn bệnh nhân'); return; }
    for (const it of newInvoice.items) {
      if (!it.item_type || !it.unit_price) { setFormError('Mỗi mục cần có loại và đơn giá'); return; }
    }
    const result = await dispatch(createInvoice({
      ...newInvoice,
      items: newInvoice.items.map(it => ({
        ...it, quantity: parseInt(it.quantity), unit_price: parseFloat(it.unit_price),
      })),
    }));
    if (result.error) setFormError(result.payload || 'Có lỗi xảy ra');
    else { setCreateOpen(false); setNewInvoice({ patient_id: '', appointment_id: '', due_date: '', items: [{ ...EMPTY_ITEM }] }); load(); }
  };

  const handlePay = async () => {
    if (!payForm.amount_paid) return;
    await dispatch(payInvoice({ id: payOpen.id, amount_paid: parseFloat(payForm.amount_paid), payment_method: payForm.payment_method }));
    setPayOpen(null); load();
  };

  const handleCancel = async (id) => {
    await dispatch(cancelInvoice(id)); load();
  };

  const canCreate = can('invoices.create');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Hóa đơn</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý thanh toán và doanh thu</Typography>
        </Box>
        {canCreate && <Button variant="contained" startIcon={<Add />} onClick={() => { setFormError(''); setCreateOpen(true); }}>Tạo hóa đơn</Button>}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField select size="small" label="Trạng thái" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); dispatch(fetchInvoices({ page: 1, limit: 10, status: e.target.value })); }} sx={{ width: 200 }}>
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
          <Button variant="outlined" size="small" onClick={() => { setStatusFilter(''); setPage(1); dispatch(fetchInvoices({ page: 1, limit: 10 })); }}><Refresh /></Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Số hóa đơn</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell align="right">Tổng tiền (₫)</TableCell>
                  <TableCell align="right">Đã trả (₫)</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hạn thanh toán</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có hóa đơn nào</TableCell></TableRow>
                ) : list.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{inv.invoice_number}</Typography></TableCell>
                    <TableCell>{inv.patient_name}</TableCell>
                    <TableCell>{new Date(inv.invoice_date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="right">{Number(inv.total_amount).toLocaleString('vi-VN')}</TableCell>
                    <TableCell align="right">{Number(inv.paid_amount).toLocaleString('vi-VN')}</TableCell>
                    <TableCell><Chip label={STATUS_LABELS[inv.status]} color={STATUS_COLORS[inv.status]} size="small" /></TableCell>
                    <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('vi-VN') : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setViewOpen(inv)} title="Chi tiết"><Visibility fontSize="small" /></IconButton>
                      {can('invoices.pay') && !['paid', 'cancelled'].includes(inv.status) && (
                        <IconButton size="small" color="success" title="Thanh toán" onClick={() => { setPayOpen(inv); setPayForm({ amount_paid: String(inv.total_amount - inv.paid_amount), payment_method: 'cash' }); }}>
                          <Payment fontSize="small" />
                        </IconButton>
                      )}
                      {can('invoices.cancel') && inv.status !== 'cancelled' && (
                        <IconButton size="small" color="error" title="Hủy" onClick={() => handleCancel(inv.id)}><Cancel fontSize="small" /></IconButton>
                      )}
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

      {/* Create Invoice */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tạo hóa đơn mới</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Bệnh nhân *" value={newInvoice.patient_id} onChange={e => setNewInvoice(f => ({ ...f, patient_id: e.target.value }))} SelectProps={{ native: true }} size="small">
                <option value="">-- Chọn bệnh nhân --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.medical_record_number})</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hạn thanh toán" value={newInvoice.due_date} onChange={e => setNewInvoice(f => ({ ...f, due_date: e.target.value }))} size="small" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={600} mb={1}>Chi tiết hóa đơn</Typography>
          {newInvoice.items.map((item, i) => (
            <Grid container spacing={1} key={i} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={3}>
                <TextField select fullWidth label="Loại" value={item.item_type} onChange={e => setItem(i, 'item_type', e.target.value)} SelectProps={{ native: true }} size="small">
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Mô tả" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField fullWidth label="SL" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} size="small" type="number" />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField fullWidth label="Đơn giá (₫)" value={item.unit_price} onChange={e => setItem(i, 'unit_price', e.target.value)} size="small" type="number" />
              </Grid>
              <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                {newInvoice.items.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => removeItem(i)}><RemoveCircle /></IconButton>
                )}
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddCircle />} size="small" onClick={addItem} sx={{ mt: 1 }}>Thêm mục</Button>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6" fontWeight={700}>
              Tổng cộng: {totalAmount.toLocaleString('vi-VN')} ₫
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>Tạo hóa đơn</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!payOpen} onClose={() => setPayOpen(null)}>
        <DialogTitle>Ghi nhận thanh toán — {payOpen?.invoice_number}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Còn lại: <strong>{payOpen ? (Number(payOpen.total_amount) - Number(payOpen.paid_amount)).toLocaleString('vi-VN') : 0} ₫</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Số tiền thanh toán (₫) *" value={payForm.amount_paid} onChange={e => setPayForm(f => ({ ...f, amount_paid: e.target.value }))} type="number" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Phương thức" value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))} size="small">
                {PAYMENT_METHODS.map(m => <MenuItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayOpen(null)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handlePay}>Xác nhận thanh toán</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewOpen} onClose={() => setViewOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết hóa đơn {viewOpen?.invoice_number}</DialogTitle>
        <DialogContent dividers>
          {viewOpen && (
            <Box>
              <Grid container spacing={1} mb={2}>
                {[
                  ['Bệnh nhân', viewOpen.patient_name],
                  ['Ngày lập', new Date(viewOpen.invoice_date).toLocaleDateString('vi-VN')],
                  ['Hạn thanh toán', viewOpen.due_date ? new Date(viewOpen.due_date).toLocaleDateString('vi-VN') : '—'],
                  ['Trạng thái', STATUS_LABELS[viewOpen.status]],
                  ['Tổng tiền', `${Number(viewOpen.total_amount).toLocaleString('vi-VN')} ₫`],
                  ['Đã thanh toán', `${Number(viewOpen.paid_amount).toLocaleString('vi-VN')} ₫`],
                  ['Còn lại', `${(Number(viewOpen.total_amount) - Number(viewOpen.paid_amount)).toLocaleString('vi-VN')} ₫`],
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
              {viewOpen.items?.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Chi tiết mục</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Loại</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell align="right">SL</TableCell>
                        <TableCell align="right">Đơn giá</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewOpen.items.map((it, i) => (
                        <TableRow key={i}>
                          <TableCell>{ITEM_TYPE_LABELS[it.item_type] || it.item_type}</TableCell>
                          <TableCell>{it.description || '—'}</TableCell>
                          <TableCell align="right">{it.quantity}</TableCell>
                          <TableCell align="right">{Number(it.unit_price).toLocaleString('vi-VN')}</TableCell>
                          <TableCell align="right">{Number(it.total_price).toLocaleString('vi-VN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

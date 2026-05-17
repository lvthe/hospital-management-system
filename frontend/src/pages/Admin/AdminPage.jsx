import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Alert, Grid, Switch, FormControlLabel,
} from '@mui/material';
import { Edit, Refresh, Settings, People } from '@mui/icons-material';
import api from '../../services/api';

const ROLE_OPTIONS = ['admin', 'doctor', 'nurse', 'receptionist', 'patient'];
const ROLE_LABELS  = { admin: 'Quản trị viên', doctor: 'Bác sĩ', nurse: 'Y tá', receptionist: 'Lễ tân', patient: 'Bệnh nhân' };
const ROLE_COLORS  = { admin: 'error', doctor: 'primary', nurse: 'secondary', receptionist: 'info', patient: 'success' };

// ── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole]   = useState('');
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async (p = page, r = roleFilter, s = search) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/admin/users', { params: { page: p, limit: 15, role: r, search: s } });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (e) {
      setError(e.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u) => { setEditUser(u); setNewRole(u.role); };

  const handleSaveRole = async () => {
    if (!editUser || newRole === editUser.role) { setEditUser(null); return; }
    setSaving(true);
    try {
      await api.put(`/admin/users/${editUser.id}/role`, { role: newRole });
      setEditUser(null);
      load(page, roleFilter, search);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi đổi role');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.patch(`/admin/users/${u.id}/active`, { is_active: !u.is_active });
      load(page, roleFilter, search);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small" label="Tìm kiếm" placeholder="Tên hoặc email..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setPage(1); load(1, roleFilter, search); } }}
          sx={{ width: 240 }}
        />
        <TextField
          select size="small" label="Role" value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); load(1, e.target.value, search); }}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
        </TextField>
        <IconButton onClick={() => { setPage(1); load(1, roleFilter, search); }} size="small"><Refresh /></IconButton>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có người dùng nào</TableCell></TableRow>
                ) : users.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{u.full_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={ROLE_LABELS[u.role]} color={ROLE_COLORS[u.role]} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Hoạt động' : 'Đã khóa'}
                        color={u.is_active ? 'success' : 'default'}
                        size="small" variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Đổi role" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                      <Switch
                        size="small"
                        checked={!!u.is_active}
                        onChange={() => handleToggleActive(u)}
                        title={u.is_active ? 'Khóa tài khoản' : 'Kích hoạt'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {pagination?.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={pagination.totalPages} page={page}
              onChange={(_, v) => { setPage(v); load(v, roleFilter, search); }}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi role — {editUser?.full_name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select fullWidth label="Role mới" value={newRole}
            onChange={e => setNewRole(e.target.value)}
          >
            {ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveRole} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── System Settings Tab ──────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({});

  useEffect(() => {
    api.get('/admin/system-settings')
      .then(r => { setSettings(r.data.data); setForm(r.data.data); })
      .catch(() => setError('Không thể tải cài đặt hệ thống'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccess(''); setError('');
    try {
      const { data } = await api.put('/admin/system-settings', form);
      setSettings(data.data);
      setSuccess('Lưu cài đặt thành công');
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi lưu cài đặt');
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box maxWidth={600}>
      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Tên bệnh viện" value={form.hospital_name || ''}
              onChange={e => setForm(f => ({ ...f, hospital_name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Giờ làm việc — Bắt đầu" type="time" value={form.business_hours_start || ''}
              onChange={e => setForm(f => ({ ...f, business_hours_start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Giờ làm việc — Kết thúc" type="time" value={form.business_hours_end || ''}
              onChange={e => setForm(f => ({ ...f, business_hours_end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Thời lượng khám mặc định (phút)" type="number"
              value={form.max_appointment_duration || ''}
              onChange={e => setForm(f => ({ ...f, max_appointment_duration: parseInt(e.target.value) }))}
              inputProps={{ min: 15, max: 120, step: 15 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Nhắc nhở lịch hẹn trước (giờ)" type="number"
              value={form.appointment_reminder_time || ''}
              onChange={e => setForm(f => ({ ...f, appointment_reminder_time: parseInt(e.target.value) }))}
              inputProps={{ min: 1, max: 72 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained" onClick={handleSave} disabled={saving}
            startIcon={<Settings />}
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Quản trị hệ thống</Typography>
        <Typography variant="body2" color="text.secondary">Quản lý người dùng và cài đặt hệ thống</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab icon={<People />} iconPosition="start" label="Người dùng" />
        <Tab icon={<Settings />} iconPosition="start" label="Cài đặt hệ thống" />
      </Tabs>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <SettingsTab />}
    </Box>
  );
}

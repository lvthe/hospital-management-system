import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  MenuItem, CircularProgress,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { register, clearError } from '../../store/slices/authSlice';

const ROLES = [
  { value: 'patient', label: 'Bệnh nhân' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'nurse', label: 'Y tá' },
  { value: 'receptionist', label: 'Lễ tân' },
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'patient' });
  const [success, setSuccess] = useState(false);

  useEffect(() => () => { dispatch(clearError()); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (!result.error) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', py: 4 }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 460, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1.5, mb: 1.5 }}>
            <LocalHospital sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>Tạo Tài Khoản</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Đăng ký thành công! Chuyển hướng...</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Họ và tên" name="full_name" value={form.full_name} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} required sx={{ mb: 2 }} helperText="Tối thiểu 8 ký tự" />
          <TextField fullWidth label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Vai trò" name="role" value={form.role} onChange={handleChange} sx={{ mb: 3 }}>
            {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontWeight: 600 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Ký'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

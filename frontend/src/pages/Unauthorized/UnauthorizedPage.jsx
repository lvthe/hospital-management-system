import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role } = usePermissions();

  const home = role === 'patient' ? '/patient-portal' : '/dashboard';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f7fa' }}>
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 3, maxWidth: 400 }}>
        <Box sx={{ bgcolor: '#ffebee', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Lock sx={{ fontSize: 40, color: '#d32f2f' }} />
        </Box>
        <Typography variant="h5" fontWeight={700} mb={1}>Không có quyền truy cập</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Tài khoản của bạn không có quyền truy cập trang này.
        </Typography>
        <Button variant="contained" onClick={() => navigate(home)}>Quay về trang chủ</Button>
      </Paper>
    </Box>
  );
}

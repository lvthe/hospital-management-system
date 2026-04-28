import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Chip } from '@mui/material';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/patients': 'Quản lý Bệnh nhân',
  '/appointments': 'Quản lý Lịch hẹn',
  '/doctors': 'Quản lý Bác sĩ',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Hospital Management';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', color: 'text.primary' }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={new Date().toLocaleDateString('vi-VN')} size="small" variant="outlined" />
          <IconButton>
            <Notifications />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

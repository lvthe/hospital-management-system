import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Button,
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, LocalHospital,
  Logout, MedicalServices,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, to: '/dashboard' },
  { label: 'Bệnh nhân', icon: <People />, to: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { label: 'Lịch hẹn', icon: <CalendarMonth />, to: '/appointments' },
  { label: 'Bác sĩ', icon: <MedicalServices />, to: '/doctors' },
];

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  nurse: 'Y tá',
  receptionist: 'Lễ tân',
  patient: 'Bệnh nhân',
};

function SidebarContent({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1a237e' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 0.8, display: 'flex' }}>
          <LocalHospital sx={{ color: '#1a237e', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white" lineHeight={1.2}>Hospital</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">Management System</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* User info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#42a5f5', width: 40, height: 40, fontSize: 16 }}>
          {user?.full_name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} color="white" noWrap>{user?.full_name}</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.6)">{ROLE_LABELS[user?.role]}</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 1 }} />

      {/* Nav */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {visibleItems.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                color: 'rgba(255,255,255,0.7)',
                '&.active': { bgcolor: 'rgba(255,255,255,0.15)', color: 'white' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
}

export default function Sidebar({ width, mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary" open={mobileOpen} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width, border: 'none' } }}
      >
        <SidebarContent onClose={onClose} />
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width, border: 'none', boxSizing: 'border-box' } }}
        open
      >
        <SidebarContent onClose={() => {}} />
      </Drawer>
    </>
  );
}

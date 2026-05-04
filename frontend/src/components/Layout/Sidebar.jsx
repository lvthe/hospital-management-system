import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Button,
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, LocalHospital, Logout,
  MedicalServices, MedicalInformation, Medication, Receipt,
  Business, BarChart, Description, AccountCircle,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';

// Menu cho staff (admin, doctor, nurse, receptionist)
const STAFF_NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { label: 'Dashboard', icon: <Dashboard />, to: '/dashboard', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    ],
  },
  {
    label: 'Quản lý bệnh nhân',
    items: [
      { label: 'Bệnh nhân',  icon: <People />,           to: '/patients',        roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { label: 'Lịch hẹn',  icon: <CalendarMonth />,     to: '/appointments',    roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { label: 'Hồ sơ y tế',icon: <MedicalInformation />,to: '/medical-records', roles: ['admin', 'doctor', 'nurse'] },
      { label: 'Đơn thuốc', icon: <Description />,       to: '/prescriptions',   roles: ['admin', 'doctor', 'nurse'] },
    ],
  },
  {
    label: 'Y tế & Dược',
    items: [
      { label: 'Bác sĩ', icon: <MedicalServices />, to: '/doctors',     roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { label: 'Thuốc',  icon: <Medication />,      to: '/medications', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    ],
  },
  {
    label: 'Tài chính & Tổ chức',
    items: [
      { label: 'Hóa đơn',  icon: <Receipt />,  to: '/invoices',    roles: ['admin', 'receptionist', 'doctor'] },
      { label: 'Phòng ban',icon: <Business />, to: '/departments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { label: 'Báo cáo', icon: <BarChart />,  to: '/reports',     roles: ['admin', 'doctor', 'receptionist'] },
    ],
  },
];

// Menu cho bệnh nhân
const PATIENT_NAV_GROUPS = [
  {
    label: 'Cổng bệnh nhân',
    items: [
      { label: 'Hồ sơ của tôi', icon: <AccountCircle />, to: '/patient-portal' },
      { label: 'Bác sĩ',        icon: <MedicalServices />, to: '/doctors' },
    ],
  },
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

  const isVisible = (item) => !item.roles || item.roles.includes(user?.role);
  const navGroups = user?.role === 'patient' ? PATIENT_NAV_GROUPS : STAFF_NAV_GROUPS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1a237e', overflowY: 'auto' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 0.8, display: 'flex' }}>
          <LocalHospital sx={{ color: '#1a237e', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white" lineHeight={1.2}>Hospital</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">Management System</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* User */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Avatar sx={{ bgcolor: '#42a5f5', width: 40, height: 40, fontSize: 16 }}>
          {user?.full_name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} color="white" noWrap>{user?.full_name}</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.6)">{ROLE_LABELS[user?.role]}</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 0.5 }} />

      {/* Nav groups */}
      <Box sx={{ flexGrow: 1, px: 1 }}>
        {navGroups.map((group) => {
          const visible = group.items.filter(isVisible);
          if (!visible.length) return null;
          return (
            <Box key={group.label} sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, display: 'block' }}>
                {group.label}
              </Typography>
              <List disablePadding>
                {visible.map((item) => (
                  <ListItem key={item.to} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={NavLink}
                      to={item.to}
                      onClick={onClose}
                      sx={{
                        borderRadius: 2, py: 0.75,
                        color: 'rgba(255,255,255,0.7)',
                        '&.active': { bgcolor: 'rgba(255,255,255,0.15)', color: 'white' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 1.5 }} />
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
      <Drawer
        variant="temporary" open={mobileOpen} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width, border: 'none' } }}
      >
        <SidebarContent onClose={onClose} />
      </Drawer>
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

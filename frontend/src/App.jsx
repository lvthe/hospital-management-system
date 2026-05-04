import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { loadUser } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PatientsPage from './pages/Patients/PatientsPage';
import AppointmentsPage from './pages/Appointments/AppointmentsPage';
import DoctorsPage from './pages/Doctors/DoctorsPage';
import MedicalRecordsPage from './pages/MedicalRecords/MedicalRecordsPage';
import MedicationsPage from './pages/Medications/MedicationsPage';
import PrescriptionsPage from './pages/Prescriptions/PrescriptionsPage';
import InvoicesPage from './pages/Invoices/InvoicesPage';
import DepartmentsPage from './pages/Departments/DepartmentsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import PatientPortalPage from './pages/Patient/PatientPortalPage';
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  shape: { borderRadius: 8 },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Trang mặc định theo role
const DefaultRedirect = () => {
  const { user } = useSelector((s) => s.auth);
  if (user?.role === 'patient') return <Navigate to="/patient-portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DefaultRedirect />} />

            {/* ── Trang chung ─────────────────────────────────────── */}
            <Route path="doctors" element={<DoctorsPage />} />

            {/* ── Cổng bệnh nhân ────────────────────────────────────*/}
            <Route path="patient-portal" element={
              <RoleRoute permission="patient.portal"><PatientPortalPage /></RoleRoute>
            } />

            {/* ── Dashboard (staff) ─────────────────────────────────*/}
            <Route path="dashboard" element={
              <RoleRoute roles={['admin', 'doctor', 'nurse', 'receptionist']}><DashboardPage /></RoleRoute>
            } />

            {/* ── Bệnh nhân ─────────────────────────────────────────*/}
            <Route path="patients" element={
              <RoleRoute permission="patients.list"><PatientsPage /></RoleRoute>
            } />

            {/* ── Lịch hẹn (staff) ──────────────────────────────────*/}
            <Route path="appointments" element={
              <RoleRoute roles={['admin', 'doctor', 'nurse', 'receptionist']}><AppointmentsPage /></RoleRoute>
            } />

            {/* ── Hồ sơ y tế ────────────────────────────────────────*/}
            <Route path="medical-records" element={
              <RoleRoute permission="medicalRecords.view"><MedicalRecordsPage /></RoleRoute>
            } />

            {/* ── Thuốc ─────────────────────────────────────────────*/}
            <Route path="medications" element={
              <RoleRoute permission="medications.view"><MedicationsPage /></RoleRoute>
            } />

            {/* ── Đơn thuốc ─────────────────────────────────────────*/}
            <Route path="prescriptions" element={
              <RoleRoute permission="prescriptions.view"><PrescriptionsPage /></RoleRoute>
            } />

            {/* ── Hóa đơn ───────────────────────────────────────────*/}
            <Route path="invoices" element={
              <RoleRoute permission="invoices.view"><InvoicesPage /></RoleRoute>
            } />

            {/* ── Phòng ban ─────────────────────────────────────────*/}
            <Route path="departments" element={
              <RoleRoute permission="departments.view"><DepartmentsPage /></RoleRoute>
            } />

            {/* ── Báo cáo ───────────────────────────────────────────*/}
            <Route path="reports" element={
              <RoleRoute permission="reports.view"><ReportsPage /></RoleRoute>
            } />
          </Route>

          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

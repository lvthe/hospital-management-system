import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { loadUser } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
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
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"       element={<DashboardPage />} />
            <Route path="patients"        element={<PatientsPage />} />
            <Route path="appointments"    element={<AppointmentsPage />} />
            <Route path="doctors"         element={<DoctorsPage />} />
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="medications"     element={<MedicationsPage />} />
            <Route path="prescriptions"   element={<PrescriptionsPage />} />
            <Route path="invoices"        element={<InvoicesPage />} />
            <Route path="departments"     element={<DepartmentsPage />} />
            <Route path="reports"         element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

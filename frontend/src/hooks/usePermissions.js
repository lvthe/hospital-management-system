import { useSelector } from 'react-redux';

// Ma trận quyền hạn toàn hệ thống
const PERMISSIONS = {
  // ── Bệnh nhân ─────────────────────────────────────────────────────
  'patients.list':   ['admin', 'doctor', 'nurse', 'receptionist'],
  'patients.create': ['admin', 'receptionist'],
  'patients.edit':   ['admin', 'receptionist'],
  'patients.delete': ['admin'],

  // ── Lịch hẹn ──────────────────────────────────────────────────────
  'appointments.list':         ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
  'appointments.create':       ['admin', 'receptionist', 'patient'],
  'appointments.cancel':       ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
  'appointments.updateStatus': ['admin', 'doctor', 'nurse'],

  // ── Hồ sơ y tế ────────────────────────────────────────────────────
  'medicalRecords.view':   ['admin', 'doctor', 'nurse'],
  'medicalRecords.create': ['admin', 'doctor'],
  'medicalRecords.edit':   ['admin', 'doctor'],
  'medicalRecords.delete': ['admin'],

  // ── Thuốc ─────────────────────────────────────────────────────────
  'medications.view':   ['admin', 'doctor', 'nurse', 'receptionist'],
  'medications.create': ['admin'],
  'medications.edit':   ['admin'],
  'medications.delete': ['admin'],
  'medications.stock':  ['admin', 'nurse'],

  // ── Đơn thuốc ─────────────────────────────────────────────────────
  'prescriptions.view':    ['admin', 'doctor', 'nurse'],
  'prescriptions.create':  ['admin', 'doctor'],
  'prescriptions.dispense':['admin', 'nurse'],
  'prescriptions.delete':  ['admin'],

  // ── Hóa đơn ───────────────────────────────────────────────────────
  'invoices.view':   ['admin', 'receptionist', 'doctor'],
  'invoices.create': ['admin', 'receptionist'],
  'invoices.pay':    ['admin', 'receptionist'],
  'invoices.cancel': ['admin'],

  // ── Phòng ban ─────────────────────────────────────────────────────
  'departments.view':   ['admin', 'doctor', 'nurse', 'receptionist'],
  'departments.create': ['admin'],
  'departments.edit':   ['admin'],
  'departments.delete': ['admin'],

  // ── Báo cáo ───────────────────────────────────────────────────────
  'reports.revenue':      ['admin'],
  'reports.appointments': ['admin', 'doctor'],
  'reports.view':         ['admin', 'doctor', 'receptionist'],

  // ── Cổng bệnh nhân ────────────────────────────────────────────────
  'patient.portal': ['patient'],
};

/**
 * Hook RBAC tập trung.
 * Dùng: const { can, role } = usePermissions();
 *       if (can('patients.create')) { ... }
 */
export function usePermissions() {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || '';

  const can = (permission) => {
    const allowed = PERMISSIONS[permission];
    if (!allowed) return false;
    return allowed.includes(role);
  };

  const canAny = (...permissions) => permissions.some(can);
  const canAll = (...permissions) => permissions.every(can);

  return { can, canAny, canAll, role, user };
}

export { PERMISSIONS };

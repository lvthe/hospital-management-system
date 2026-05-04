import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Bảo vệ route theo permission.
 * Dùng: <RoleRoute permission="patients.list"><PatientsPage /></RoleRoute>
 * Hoặc: <RoleRoute roles={['admin','doctor']}><Page /></RoleRoute>
 */
export default function RoleRoute({ children, permission, roles }) {
  const { can, role } = usePermissions();

  let allowed = false;
  if (permission) allowed = can(permission);
  else if (roles) allowed = roles.includes(role);
  else allowed = true;

  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return children;
}

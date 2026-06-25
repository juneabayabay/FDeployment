import { Navigate, Outlet } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

export default function PermissionRoute({ permission, permissions, roles }) {
  const { can, canAny, hasAnyRole } = usePermission();

  const permissionOk =
    (!permission && !permissions) ||
    (permission && can(permission)) ||
    (permissions && canAny(permissions));

  const roleOk = !roles || hasAnyRole(roles);

  const allowed = permissionOk && roleOk;

  if (!allowed) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

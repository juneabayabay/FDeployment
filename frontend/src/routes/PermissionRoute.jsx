import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { userHasRoleAccess } from '../utils/auth';

export default function PermissionRoute({ permission, permissions, roles }) {
  const { user } = useAuth();
  const { can, canAny } = usePermission();

  const permissionOk =
    (!permission && !permissions) ||
    (permission && can(permission)) ||
    (permissions && canAny(permissions));

  const roleOk = !roles || userHasRoleAccess(user, roles);

  const allowed = permissionOk && roleOk;

  if (!allowed) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

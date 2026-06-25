import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getSafeDashboardPath, userHasRoleAccess } from '../utils/auth';

/**
 * @param {string | string[]} roles - Allowed role slug(s): admin | dentist | receptionist | user
 */
export default function RoleProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage label="Checking access..." />;

  if (!userHasRoleAccess(user, roles)) {
    const target = getSafeDashboardPath(user);
    return <Navigate to={target || '/unauthorized'} replace />;
  }

  return <Outlet />;
}

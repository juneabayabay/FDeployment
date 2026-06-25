import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStaffPrefix } from '../utils/auth';
import { ROLES } from '../utils/constants';
import { hasRole } from '../utils/permissions';

function getLegacyPrefix(user) {
  const staffPrefix = getStaffPrefix(user);
  if (staffPrefix) return staffPrefix;
  if (user && hasRole(user, ROLES.USER)) return '/patient';
  return '/unauthorized';
}

export default function LegacyStaffRedirect() {
  const { user } = useAuth();
  const location = useLocation();
  const prefix = getLegacyPrefix(user);
  return <Navigate to={`${prefix}${location.pathname}`} replace />;
}

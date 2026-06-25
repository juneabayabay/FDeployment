import { useAuth } from './useAuth';
import { hasAnyPermission, hasAnyRole, hasPermission, hasRole } from '../utils/permissions';

export const usePermission = () => {
  const { user } = useAuth();

  return {
    user,
    can: (permission) => hasPermission(user, permission),
    canAny: (permissions) => hasAnyPermission(user, permissions),
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
  };
};

import { ROLES } from './constants';

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.permission_codenames?.includes(permission) ?? false;
};

export const hasAnyPermission = (user, permissions = []) => {
  return permissions.some((p) => hasPermission(user, p));
};

export const hasRole = (user, role) => {
  if (!user) return false;
  // Match userHasRoleAccess: superusers may use admin-only routes without a UserRole row
  if (role === ROLES.ADMIN && user.is_superuser) return true;
  return user.role_slugs?.includes(role) ?? false;
};

export const hasAnyRole = (user, roles = []) => {
  return roles.some((r) => hasRole(user, r));
};

export const isClinicStaff = (user) => {
  return hasAnyRole(user, ['admin', 'dentist', 'receptionist']);
};

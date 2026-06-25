import { DASHBOARD_PATHS, ROLES, STAFF_ROLES } from './constants';
import { hasRole } from './permissions';

const ROLE_PRIORITY = [ROLES.ADMIN, ROLES.DENTIST, ROLES.RECEPTIONIST, ROLES.USER];

/** Primary clinic role for routing (admin wins if multiple). */
export function getPrimaryRole(user) {
  if (!user) return null;
  if (user.is_superuser) return ROLES.ADMIN;
  for (const role of ROLE_PRIORITY) {
    if (user.role_slugs?.includes(role)) return role;
  }
  return null;
}

export function getDashboardPath(user) {
  const role = getPrimaryRole(user);
  return role ? DASHBOARD_PATHS[role] : '/';
}

export function getStaffPrefix(user) {
  const role = getPrimaryRole(user);
  if (!role || !STAFF_ROLES.includes(role)) return null;
  return `/${role}`;
}

export function userHasRoleAccess(user, allowedRoles) {
  if (!user || !allowedRoles) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.length) return false;
  if (roles.includes(ROLES.ADMIN) && user.is_superuser) return true;
  return roles.some((r) => hasRole(user, r));
}

/** Safe redirect target after login — never returns `/` for authenticated users. */
export function getSafeDashboardPath(user) {
  const path = getDashboardPath(user);
  return path && path !== '/' ? path : null;
}

export function staffPath(user, suffix) {
  const prefix = getStaffPrefix(user) || '';
  return `${prefix}${suffix}`;
}

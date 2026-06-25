import { useAuth } from './useAuth';
import { getStaffPrefix, staffPath } from '../utils/auth';

export function useStaffPaths() {
  const { user, dashboardPath } = useAuth();
  const basePath = getStaffPrefix(user) || '';

  return {
    basePath,
    dashboardPath,
    path: (suffix) => staffPath(user, suffix),
  };
}

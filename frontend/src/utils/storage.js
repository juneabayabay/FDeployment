import { LOGIN_PATHS } from './constants';

const ACCESS_KEY = 'barnabas_access_token';
const REFRESH_KEY = 'barnabas_refresh_token';
const USER_KEY = 'barnabas_user';
const PORTAL_KEY = 'barnabas_login_portal';

// Access token: sessionStorage (tab-scoped, cleared on close)
export const getAccessToken = () => sessionStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access, refresh) => {
  sessionStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PORTAL_KEY);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const setLoginPortal = (role) => {
  localStorage.setItem(PORTAL_KEY, role);
};

export const getLoginPortal = () => localStorage.getItem(PORTAL_KEY);

export const portalLoginPath = (role) => LOGIN_PATHS[role] || '/';

/** Where to send unauthenticated users based on the route they tried to open. */
export const getUnauthenticatedLoginPath = (pathname) => {
  if (pathname.startsWith('/patient') || pathname.startsWith('/patien')) {
    return LOGIN_PATHS.user;
  }
  const portal = getLoginPortal();
  return portal ? portalLoginPath(portal) : LOGIN_PATHS.user;
};

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services';
import { getDashboardPath } from '../utils/auth';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));

  const loadUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data);
      setStoredUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getAccessToken()) {
      loadUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [loadUser]);

  // Safety: never leave auth in loading state forever
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => setLoading(false), 16000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    setTokens(data.access, data.refresh);
    setUser(data.user);
    setStoredUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    return data;
  };

  const logout = async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) await authService.logout(refresh);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const forgotPassword = (email) => authService.forgotPassword(email);
  const resetPassword = (data) => authService.resetPassword(data);
  const changePassword = (data) => authService.changePassword(data);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      refreshUser: loadUser,
      dashboardPath: getDashboardPath(user),
    }),
    [user, loading, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import AdminAuthBrand from '../../components/auth/admin/AdminAuthBrand';
import AdminAuthButton from '../../components/auth/admin/AdminAuthButton';
import AdminAuthDivider from '../../components/auth/admin/AdminAuthDivider';
import AdminAuthField from '../../components/auth/admin/AdminAuthField';
import AdminAuthShell from '../../components/auth/admin/AdminAuthShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole } from '../../utils/permissions';
import { DASHBOARD_PATHS, ROLES } from '../../utils/constants';
import { setLoginPortal } from '../../utils/storage';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <LoadingSpinner fullPage label="Checking session..." />;
  }

  if (isAuthenticated && user) {
    if (hasRole(user, ROLES.ADMIN) || user.is_superuser) {
      return <Navigate to={DASHBOARD_PATHS[ROLES.ADMIN]} replace />;
    }
    const dest = getSafeDashboardPath(user);
    if (dest) {
      return <Navigate to={dest} replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      const isAuthorized = loggedInUser.is_superuser || hasRole(loggedInUser, ROLES.ADMIN);

      if (!isAuthorized) {
        await logout();
        setError('This account is not authorized for this portal. Use the correct login page.');
        return;
      }
      setLoginPortal(ROLES.ADMIN);
      navigate(DASHBOARD_PATHS[ROLES.ADMIN], { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Start the backend (python manage.py runserver) and use http://localhost:5173.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthShell>
      <AdminAuthBrand />

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="admin-auth-alert admin-auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <AdminAuthField
          icon={FaEnvelope}
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <AdminAuthField
          icon={FaLock}
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          showToggle
        />

        <div className="admin-auth-forgot">
          <Link to="/forgot-password">Reset credentials</Link>
        </div>

        <AdminAuthButton loading={loading} icon={FaSignInAlt}>
          {loading ? 'Signing in...' : 'Sign in'}
        </AdminAuthButton>
      </form>

      <AdminAuthDivider />
    </AdminAuthShell>
  );
}

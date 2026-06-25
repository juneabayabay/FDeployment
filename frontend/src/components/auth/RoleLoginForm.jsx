import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole } from '../../utils/permissions';
import { DASHBOARD_PATHS, ROLES } from '../../utils/constants';
import { setLoginPortal } from '../../utils/storage';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

export default function RoleLoginForm({
  role,
  title,
  subtitle,
  registerLink,
  forgotPasswordLink,
}) {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, loading: authLoading, user } = useAuth();
  const targetDashboard = DASHBOARD_PATHS[role];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <LoadingSpinner label="Checking session..." />;
  }

  if (isAuthenticated && user) {
    if (hasRole(user, role) || (role === ROLES.ADMIN && user.is_superuser)) {
      return <Navigate to={targetDashboard} replace />;
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
      const user = await login(email, password);
      const isAuthorized =
        role === ROLES.ADMIN
          ? user.is_superuser || hasRole(user, role)
          : hasRole(user, role);

      if (!isAuthorized) {
        await logout();
        setError('This account is not authorized for this portal. Use the correct login page.');
        return;
      }
      setLoginPortal(role);
      navigate(DASHBOARD_PATHS[role], { replace: true });
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
    <div className="card w-full max-w-md">
      <p className="text-sm font-medium text-sky-600">{subtitle}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="label">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="label">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {forgotPasswordLink && (
          <p className="text-center text-sm">
            <Link to={forgotPasswordLink} className="text-sky-600 hover:text-sky-800">
              Forgot password?
            </Link>
          </p>
        )}
        {registerLink && (
          <p className="text-center text-sm text-slate-600">
            No account?{' '}
            <Link to={registerLink} className="text-sky-600 hover:text-sky-800">
              Register as patient
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import DentistAuthBrand from '../../components/auth/dentist/DentistAuthBrand';
import DentistAuthButton from '../../components/auth/dentist/DentistAuthButton';
import DentistAuthDivider from '../../components/auth/dentist/DentistAuthDivider';
import DentistAuthField from '../../components/auth/dentist/DentistAuthField';
import DentistAuthShell from '../../components/auth/dentist/DentistAuthShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole } from '../../utils/permissions';
import { DASHBOARD_PATHS, ROLES } from '../../utils/constants';
import { setLoginPortal } from '../../utils/storage';

export default function DentistLoginPage() {
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
    if (hasRole(user, ROLES.DENTIST)) {
      return <Navigate to={DASHBOARD_PATHS[ROLES.DENTIST]} replace />;
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

      if (!hasRole(loggedInUser, ROLES.DENTIST)) {
        await logout();
        setError('This account is not authorized for this portal. Use the correct login page.');
        return;
      }
      setLoginPortal(ROLES.DENTIST);
      navigate(DASHBOARD_PATHS[ROLES.DENTIST], { replace: true });
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
    <DentistAuthShell>
      <DentistAuthBrand />
      <h1 className="dentist-auth-title">Dentist Portal</h1>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="dentist-auth-alert dentist-auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <DentistAuthField
          icon={FaEnvelope}
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <DentistAuthField
          icon={FaLock}
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          showToggle
        />

        <DentistAuthButton loading={loading} icon={FaSignInAlt}>
          {loading ? 'Signing in...' : 'Sign in'}
        </DentistAuthButton>
      </form>

      <DentistAuthDivider />
    </DentistAuthShell>
  );
}

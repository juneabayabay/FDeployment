import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import ReceptionistAuthBrand from '../../components/auth/receptionist/ReceptionistAuthBrand';
import ReceptionistAuthButton from '../../components/auth/receptionist/ReceptionistAuthButton';
import ReceptionistAuthDivider from '../../components/auth/receptionist/ReceptionistAuthDivider';
import ReceptionistAuthField from '../../components/auth/receptionist/ReceptionistAuthField';
import ReceptionistAuthShell from '../../components/auth/receptionist/ReceptionistAuthShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole } from '../../utils/permissions';
import { DASHBOARD_PATHS, ROLES } from '../../utils/constants';
import { setLoginPortal } from '../../utils/storage';

export default function ReceptionistLoginPage() {
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
    if (hasRole(user, ROLES.RECEPTIONIST)) {
      return <Navigate to={DASHBOARD_PATHS[ROLES.RECEPTIONIST]} replace />;
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

      if (!hasRole(loggedInUser, ROLES.RECEPTIONIST)) {
        await logout();
        setError('This account is not authorized for this portal. Use the correct login page.');
        return;
      }
      setLoginPortal(ROLES.RECEPTIONIST);
      navigate(DASHBOARD_PATHS[ROLES.RECEPTIONIST], { replace: true });
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
    <ReceptionistAuthShell>
      <ReceptionistAuthBrand />

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="receptionist-auth-alert receptionist-auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <ReceptionistAuthField
          icon={FaEnvelope}
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <ReceptionistAuthField
          icon={FaLock}
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          showToggle
        />

        <ReceptionistAuthButton loading={loading} icon={FaSignInAlt}>
          {loading ? 'Signing in...' : 'Sign in'}
        </ReceptionistAuthButton>
      </form>

      <ReceptionistAuthDivider />
    </ReceptionistAuthShell>
  );
}

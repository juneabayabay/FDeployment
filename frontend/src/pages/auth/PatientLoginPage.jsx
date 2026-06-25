import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import PatientAuthButton from '../../components/auth/patient/PatientAuthButton';
import PatientAuthDivider from '../../components/auth/patient/PatientAuthDivider';
import PatientAuthField from '../../components/auth/patient/PatientAuthField';
import PatientAuthShell from '../../components/auth/patient/PatientAuthShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole, isClinicStaff } from '../../utils/permissions';
import { DASHBOARD_PATHS, ROLES } from '../../utils/constants';
import { setLoginPortal } from '../../utils/storage';

export default function PatientLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registrationAlert, setRegistrationAlert] = useState(
    () => location.state?.registrationSuccess ?? false
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.registrationSuccess, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !hasRole(user, ROLES.USER) && !isClinicStaff(user)) {
      logout();
      setError('Your session was invalid. Please sign in again.');
    }
  }, [authLoading, isAuthenticated, user, logout]);

  if (authLoading) {
    return <LoadingSpinner fullPage label="Checking session..." />;
  }

  if (isAuthenticated && user) {
    if (hasRole(user, ROLES.USER)) {
      return <Navigate to={DASHBOARD_PATHS[ROLES.USER]} replace />;
    }
    const staffDest = getSafeDashboardPath(user);
    if (staffDest) {
      return <Navigate to={staffDest} replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (!hasRole(loggedInUser, ROLES.USER)) {
        await logout();
        setError('This account is not a patient account. Please use the correct portal.');
        return;
      }
      setLoginPortal(ROLES.USER);
      navigate(DASHBOARD_PATHS[ROLES.USER], { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Start the backend (python manage.py runserver) and open the URL shown by npm run dev.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientAuthShell>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="patient-auth-alert patient-auth-alert--error" role="alert">
            {error}
          </div>
        )}

        {registrationAlert && (
          <div className="patient-auth-alert patient-auth-alert--success" role="status">
            <span className="block font-semibold">Account Created Successfully</span>
            <span className="mt-1 block">Please sign in using your email and password.</span>
            <button
              type="button"
              onClick={() => setRegistrationAlert(false)}
              className="mt-2 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <PatientAuthField
          icon={FaEnvelope}
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <PatientAuthField
          icon={FaLock}
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          showToggle
        />

        <div className="patient-auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <PatientAuthButton loading={loading} icon={FaSignInAlt}>
          {loading ? 'Signing in...' : 'Go to Dashboard'}
        </PatientAuthButton>
      </form>

      <PatientAuthDivider />
      <p className="patient-auth-switch">
        New patient? <Link to="/register">Create an account</Link>
      </p>
    </PatientAuthShell>
  );
}

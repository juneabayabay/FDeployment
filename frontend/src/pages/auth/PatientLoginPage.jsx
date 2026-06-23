import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AlertBanner from '../../components/common/AlertBanner';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';
import { hasRole, isClinicStaff } from '../../utils/permissions';
import { APP_NAME, DASHBOARD_PATHS, ROLES } from '../../utils/constants';
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

  // Clear corrupt sessions (authenticated but no valid role)
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-center lg:flex">
          <h1 className="text-3xl font-bold text-slate-900">🦷 {APP_NAME}</h1>
          <p className="mt-2 text-sky-600">Patient Portal</p>
          <ul className="mt-6 space-y-2 text-slate-600">
            <li>• Book appointments online</li>
            <li>• Pencil booking (4-hour hold)</li>
            <li>• View billing &amp; notifications</li>
            <li>• Join the waiting list</li>
          </ul>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your patient account to access the dashboard.</p>
          <div className="mt-6 space-y-4">
            <ErrorMessage message={error} />
            {registrationAlert && (
              <AlertBanner
                variant="success"
                message={
                  <>
                    <span className="block font-semibold">Account Created Successfully</span>
                    <span className="mt-1 block">Please sign in using your email and password.</span>
                  </>
                }
                onDismiss={() => setRegistrationAlert(false)}
              />
            )}
            <label className="label">
              Email
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="label">
              Password
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <p className="text-sm">
              <Link to="/forgot-password" className="text-sky-600 hover:text-sky-800">Forgot password?</Link>
            </p>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Go to Dashboard'}
            </button>
            <p className="text-center text-sm text-slate-600">
              New patient? <Link to="/register" className="text-sky-600 hover:text-sky-800">Create an account</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaUserPlus } from 'react-icons/fa';
import PatientAuthButton from '../../components/auth/patient/PatientAuthButton';
import PatientAuthDivider from '../../components/auth/patient/PatientAuthDivider';
import PatientAuthField from '../../components/auth/patient/PatientAuthField';
import PatientAuthShell from '../../components/auth/patient/PatientAuthShell';
import PasswordInput from '../../components/common/PasswordInput';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/formatters';

const REDIRECT_DELAY_MS = 3000;

function clearPasswords(prev) {
  return { ...prev, password: '', password_confirm: '' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorToast(null);
    setSuccessToast(null);

    if (form.password !== form.password_confirm) {
      setErrorToast({
        title: 'Registration Failed',
        message: 'Passwords do not match. Please try again.',
      });
      setForm(clearPasswords);
      return;
    }

    setLoading(true);
    try {
      await register(form);

      setSuccessToast({
        title: 'Registration Successful',
        message:
          'Your patient account has been created successfully. Redirecting you to the login page...',
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { registrationSuccess: true },
        });
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      setErrorToast({
        title: 'Registration Failed',
        message: parseApiError(err),
      });
      setForm(clearPasswords);
      setLoading(false);
    }
  };

  const submitDisabled = loading || !!successToast;

  return (
    <>
      {successToast && (
        <Toast
          variant="success"
          title={successToast.title}
          message={successToast.message}
          onDismiss={() => setSuccessToast(null)}
          position="bottom"
        />
      )}
      {errorToast && (
        <Toast
          variant="error"
          title={errorToast.title}
          message={errorToast.message}
          onDismiss={() => setErrorToast(null)}
          position="bottom"
        />
      )}

      <PatientAuthShell>
        <h1 className="patient-auth-title">Join our clinic</h1>
        <p className="patient-auth-subhead">
          Create your account and book your first appointment in seconds.
        </p>

        <form onSubmit={handleSubmit}>
          <PatientAuthField
            icon={FaUser}
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            autoComplete="given-name"
            disabled={submitDisabled}
          />

          <PatientAuthField
            icon={FaUser}
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            autoComplete="family-name"
            disabled={submitDisabled}
          />

          <PatientAuthField
            icon={FaEnvelope}
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={submitDisabled}
          />

          <div className="patient-auth-field">
            <label className="patient-auth-label" htmlFor="password">
              Password
            </label>
            <div className="patient-auth-input-wrap">
              <FaLock className="patient-auth-input-icon" aria-hidden />
              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={submitDisabled}
                variant="patient"
              />
            </div>
          </div>

          <div className="patient-auth-field">
            <label className="patient-auth-label" htmlFor="password_confirm">
              Confirm Password
            </label>
            <div className="patient-auth-input-wrap">
              <FaLock className="patient-auth-input-icon" aria-hidden />
              <PasswordInput
                id="password_confirm"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={submitDisabled}
                variant="patient"
              />
            </div>
          </div>

          <PatientAuthButton loading={loading} icon={FaUserPlus} disabled={submitDisabled}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </PatientAuthButton>
        </form>

        <PatientAuthDivider />
        <p className="patient-auth-switch">
          Already have an account? <Link to="/login">Patient login</Link>
        </p>
        <Link to="/" className="patient-auth-back">
          ← Back to portal selection
        </Link>
      </PatientAuthShell>
    </>
  );
}

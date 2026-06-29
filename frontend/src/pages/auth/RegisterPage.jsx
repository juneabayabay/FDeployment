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
    date_of_birth: '',
    medical_history: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  if (isAuthenticated) return <Navigate to="/patient/dashboard" replace />;

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
      const payload = {
        ...form,
        date_of_birth: form.date_of_birth || undefined,
        medical_history: form.medical_history || undefined,
        allergies: form.allergies || undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
      };
      await register(payload);

      setSuccessToast({
        title: 'Registration Successful',
        message:
          'Your account has been created. Check your email to verify your address, then sign in to book appointments.',
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { registrationSuccess: true, verifyEmail: true },
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

      <PatientAuthShell wide>
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

          <details className="patient-auth-field">
            <summary className="cursor-pointer text-sm font-medium" style={{ color: 'var(--patient-muted)' }}>
              Optional medical information
            </summary>
            <div className="mt-3 space-y-3">
              <PatientAuthField
                label="Date of birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                disabled={submitDisabled}
                required={false}
              />
              <label className="patient-auth-label" htmlFor="medical_history">
                Medical history
              </label>
              <textarea
                id="medical_history"
                name="medical_history"
                className="patient-auth-input w-full min-h-[72px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.medical_history}
                onChange={handleChange}
                disabled={submitDisabled}
                placeholder="Past conditions, surgeries..."
              />
              <label className="patient-auth-label" htmlFor="allergies">
                Allergies
              </label>
              <textarea
                id="allergies"
                name="allergies"
                className="patient-auth-input w-full min-h-[60px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.allergies}
                onChange={handleChange}
                disabled={submitDisabled}
                placeholder="Drug allergies, latex..."
              />
              <PatientAuthField
                label="Emergency contact name"
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={handleChange}
                disabled={submitDisabled}
                required={false}
              />
              <PatientAuthField
                label="Emergency contact phone"
                name="emergency_contact_phone"
                type="tel"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                disabled={submitDisabled}
                required={false}
              />
            </div>
          </details>

          <PatientAuthButton loading={loading} icon={FaUserPlus} disabled={submitDisabled}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </PatientAuthButton>
        </form>

        <PatientAuthDivider />
        <p className="patient-auth-switch">
          Already have an account? <Link to="/login">Patient login</Link>
        </p>
        <Link to="/" className="patient-auth-back">
          ← Back to home
        </Link>
      </PatientAuthShell>
    </>
  );
}

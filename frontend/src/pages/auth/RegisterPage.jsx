import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/common/PasswordInput';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/formatters';

const REDIRECT_DELAY_MS = 3000;

function formatLabel(field) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
        />
      )}
      {errorToast && (
        <Toast
          variant="error"
          title={errorToast.title}
          message={errorToast.message}
          onDismiss={() => setErrorToast(null)}
        />
      )}

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
        <form className="card w-full max-w-md" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-slate-900">Patient Registration</h1>
          <p className="mt-1 text-sm text-slate-500">Create your account to book appointments online.</p>
          <div className="mt-6 space-y-4">
            {['first_name', 'last_name', 'email'].map((field) => (
              <label key={field} className="label">
                {formatLabel(field)}
                <input
                  className="input"
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  autoComplete={field === 'email' ? 'email' : field}
                  disabled={submitDisabled}
                />
              </label>
            ))}

            <label className="label">
              Password
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={submitDisabled}
              />
            </label>

            <label className="label">
              Confirm Password
              <PasswordInput
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={submitDisabled}
              />
            </label>

            <button type="submit" className="btn-primary w-full gap-2" disabled={submitDisabled}>
              {loading && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden
                />
              )}
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            <p className="text-center text-sm">
              Already have an account? <Link to="/login" className="text-sky-600">Patient login</Link>
            </p>
            <p className="text-center text-sm">
              <Link to="/" className="text-slate-500">← Back to portal selection</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

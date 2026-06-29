import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import PatientAuthButton from '../../components/auth/patient/PatientAuthButton';
import PatientAuthField from '../../components/auth/patient/PatientAuthField';
import PatientAuthShell from '../../components/auth/patient/PatientAuthShell';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services';

const GMAIL_SETUP_STEPS = [
  'Open https://myaccount.google.com/apppasswords (2-Step Verification must be on).',
  'Create an App Password for "Mail" / "Other (Barnabas)".',
  'In backend/.env set EMAIL_HOST_USER=your@gmail.com and EMAIL_HOST_PASSWORD=the 16-character app password.',
  'Restart the backend: python manage.py runserver',
  'Test: python manage.py check_email your@gmail.com',
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setShowSetup(false);
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(
        res.data.detail
          || 'If an account exists with that email, a confirmation message has been sent. Open Gmail and check your inbox and spam folder.'
      );
    } catch (err) {
      const detail = err.response?.data?.detail;
      const code = err.response?.data?.code;
      setError(detail || 'Could not send confirmation email. Try again.');
      setShowSetup(code === 'smtp_not_configured' || code === 'smtp_send_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientAuthShell>
      <h1 className="patient-auth-title">Forgot your password?</h1>
      <p className="patient-auth-subhead">
        Enter your email. We will send a confirmation link to your Gmail inbox — only click it if
        you requested a reset.
      </p>

      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        {showSetup && (
          <div className="patient-auth-alert patient-auth-alert--error mb-4">
            <p className="font-semibold">Gmail setup (one-time, local dev)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
              {GMAIL_SETUP_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        {message && (
          <div className="patient-auth-alert patient-auth-alert--success" role="status">
            <p className="font-semibold">Check your Gmail</p>
            <p className="mt-1 text-sm">{message}</p>
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
          disabled={!!message}
        />

        <PatientAuthButton loading={loading} disabled={loading || !!message}>
          {loading ? 'Sending...' : message ? 'Email sent' : 'Send confirmation email'}
        </PatientAuthButton>

        {message && (
          <p className="patient-auth-switch mt-4">
            Did not receive it? Check spam, wait a minute, or{' '}
            <button
              type="button"
              className="font-semibold"
              style={{ color: 'var(--patient-teal)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setMessage('');
                setError('');
              }}
            >
              try again
            </button>
            .
          </p>
        )}
      </form>

      <Link to="/login" className="patient-auth-back">
        ← Back to patient login
      </Link>
    </PatientAuthShell>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services';
import { APP_NAME } from '../../utils/constants';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <form className="card w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
        <p className="mt-2 font-medium text-slate-700">Forgot your password?</p>
        <p className="text-sm text-slate-500">
          Enter your email. We will send a confirmation link to your Gmail inbox — only click it if you requested a reset.
        </p>
        <div className="mt-6 space-y-4">
          <ErrorMessage message={error} />
          {showSetup && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">Gmail setup (one-time, local dev)</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                {GMAIL_SETUP_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          {message && (
            <div className="alert-success" role="status">
              <p className="font-semibold">Check your Gmail</p>
              <p className="mt-1 text-sm">{message}</p>
            </div>
          )}
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!message}
            />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading || !!message}>
            {loading ? 'Sending...' : message ? 'Email sent' : 'Send confirmation email'}
          </button>
          {message && (
            <p className="text-center text-sm text-slate-600">
              Did not receive it? Check spam, wait a minute, or{' '}
              <button
                type="button"
                className="text-sky-600 underline"
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
          <p className="text-center text-sm">
            <Link to="/" className="text-sky-600">← Back to patient login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

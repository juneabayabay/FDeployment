import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services';
import { APP_NAME } from '../../utils/constants';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(
        res.data.detail
          || 'If an account exists with that email, a confirmation message has been sent. Check your Gmail inbox and spam folder.'
      );
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Could not send confirmation email. Try again.');
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
          Enter your email. We will send a confirmation link to your inbox — only click it if you requested a reset.
        </p>
        <div className="mt-6 space-y-4">
          <ErrorMessage message={error} />
          {message && <div className="alert-success">{message}</div>}
          <label className="label">
            Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send confirmation email'}
          </button>
          <p className="text-center text-sm">
            <Link to="/" className="text-sky-600">← Back to patient login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

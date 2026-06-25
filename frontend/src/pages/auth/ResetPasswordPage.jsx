import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services';
import { APP_NAME } from '../../utils/constants';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', new_password_confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!uid || !token) {
      setError('Invalid reset link. Request a new one.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ uid, token, ...form });
      setMessage(res.data.detail);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <form className="card w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
        <p className="mt-2 text-slate-600">Reset your password</p>
        <div className="mt-6 space-y-4">
          <ErrorMessage message={error} />
          {message && <div className="alert-success">{message}</div>}
          <label className="label">
            New password
            <input className="input" name="new_password" type="password" value={form.new_password} onChange={handleChange} required />
          </label>
          <label className="label">
            Confirm new password
            <input className="input" name="new_password_confirm" type="password" value={form.new_password_confirm} onChange={handleChange} required />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <p className="text-center text-sm">
            <Link to="/" className="text-sky-600">← Back to patient login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

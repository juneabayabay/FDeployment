import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services';
import { APP_NAME } from '../../utils/constants';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const handleVerify = async () => {
    setError('');
    setMessage('');
    if (!uid || !token) {
      setError('Invalid verification link. Sign in and request a new verification email.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyEmail({ uid, token });
      setMessage(data.detail || 'Email verified successfully.');
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid && token && !done && !loading && !message && !error) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-clinic-100 p-4">
      <div className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-clinic-heading">{APP_NAME}</h1>
        <p className="text-clinic-body">Verify your patient account email</p>
        <ErrorMessage message={error} />
        {message && <div className="alert-success">{message}</div>}
        {!done && (
          <button type="button" className="btn-primary w-full" onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying…' : 'Confirm email address'}
          </button>
        )}
        <p className="text-center text-sm">
          <Link to="/login" className="text-clinic-500">
            ← Back to patient login
          </Link>
        </p>
      </div>
    </div>
  );
}

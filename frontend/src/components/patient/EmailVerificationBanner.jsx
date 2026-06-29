import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertBanner from '../common/AlertBanner';
import { authService } from '../../services';
import { parseApiError } from '../../utils/formatters';
import { needsEmailVerification } from '../../utils/patientDemographics';

export default function EmailVerificationBanner({ user, onResent }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!needsEmailVerification(user)) return null;

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await authService.resendVerification();
      setMessage(data.detail || 'Verification email sent.');
      onResent?.();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <AlertBanner
        variant="warning"
        message="Your email is not verified yet. Please check your inbox and confirm your address before booking appointments."
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" className="btn-outline btn-sm" onClick={handleResend} disabled={loading}>
          {loading ? 'Sending…' : 'Resend verification email'}
        </button>
        <Link to="/patient/profile" className="text-clinic-500 hover:text-clinic-700">
          Update profile
        </Link>
      </div>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

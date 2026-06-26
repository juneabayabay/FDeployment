import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import AvatarUploadSection from '../../components/profile/AvatarUploadSection';
import DentistProfileForm from '../../components/profile/DentistProfileForm';
import { authService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { parseApiError } from '../../utils/formatters';

function ProfileDetailsForm({ user, refreshUser, onMessage, onError }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    onMessage('');
    try {
      await authService.updateMe(form);
      await refreshUser();
      onMessage('Profile updated.');
    } catch (err) {
      onError(parseApiError(err));
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold text-slate-900">Personal info</h3>
      {['first_name', 'last_name', 'phone'].map((field) => (
        <label key={field} className="label">
          {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          <input
            className="input"
            value={form[field]}
            onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
            required={field !== 'phone'}
          />
        </label>
      ))}
      <p className="text-sm text-slate-500">Email: {user.email}</p>
      <button type="submit" className="btn-primary">Save profile</button>
    </form>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const isPatient = window.location.pathname.startsWith('/patient');

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authService.changePassword(passwordForm);
      setMessage('Password changed. Please log in again.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
      {message && <div className="alert-success">{message}</div>}
      <ErrorMessage message={error} />

      {user && (
        <AvatarUploadSection
          user={user}
          onUpdated={refreshUser}
          onMessage={setMessage}
          onError={setError}
        />
      )}

      {user && user.role_slugs?.includes(ROLES.DENTIST) && (
        <DentistProfileForm onMessage={setMessage} onError={setError} />
      )}

      {user && (
        <ProfileDetailsForm
          key={user.id}
          user={user}
          refreshUser={refreshUser}
          onMessage={setMessage}
          onError={setError}
        />
      )}

      <form className="card space-y-4" onSubmit={handlePasswordSubmit}>
        <h3 className="font-semibold text-slate-900">Change password</h3>
        {['current_password', 'new_password', 'new_password_confirm'].map((field) => (
          <label key={field} className="label">
            {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            <input
              className="input"
              type="password"
              value={passwordForm[field]}
              onChange={(e) => setPasswordForm((p) => ({ ...p, [field]: e.target.value }))}
              required
            />
          </label>
        ))}
        <button type="submit" className="btn-secondary">Change password</button>
      </form>

      {isPatient && (
        <p className="text-sm">
          <Link to="/patient/dashboard" className="text-sky-600">← Back to dashboard</Link>
        </p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import ErrorMessage from '../../components/common/ErrorMessage';
import AvatarUploadSection from '../../components/profile/AvatarUploadSection';
import { ProfileSkeleton } from '../../components/patient/PatientSkeletons';
import { authService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
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

function MedicalHistoryForm({ user, refreshUser, onMessage, onError }) {
  const [form, setForm] = useState({
    date_of_birth: user.date_of_birth || '',
    medical_history: user.medical_history || '',
    allergies: user.allergies || '',
    emergency_contact_name: user.emergency_contact_name || '',
    emergency_contact_phone: user.emergency_contact_phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    onMessage('');
    try {
      const payload = {
        ...form,
        date_of_birth: form.date_of_birth || null,
      };
      await authService.updateMe(payload);
      await refreshUser();
      onMessage('Medical history updated.');
    } catch (err) {
      onError(parseApiError(err));
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold text-slate-900">Medical history</h3>
      <p className="text-sm text-slate-500">
        Optional — helps our dentists prepare for your visit. You can update this anytime.
      </p>
      <label className="label">
        Date of birth
        <input
          className="input"
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))}
        />
      </label>
      {user.age != null && (
        <p className="text-sm text-slate-600">Age: {user.age} years</p>
      )}
      <label className="label">
        Medical history
        <textarea
          className="input min-h-[80px]"
          value={form.medical_history}
          onChange={(e) => setForm((p) => ({ ...p, medical_history: e.target.value }))}
          placeholder="Past conditions, surgeries, ongoing treatments..."
        />
      </label>
      <label className="label">
        Allergies
        <textarea
          className="input min-h-[60px]"
          value={form.allergies}
          onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
          placeholder="Drug allergies, latex, etc."
        />
      </label>
      <label className="label">
        Emergency contact name
        <input
          className="input"
          value={form.emergency_contact_name}
          onChange={(e) => setForm((p) => ({ ...p, emergency_contact_name: e.target.value }))}
        />
      </label>
      <label className="label">
        Emergency contact phone
        <input
          className="input"
          type="tel"
          value={form.emergency_contact_phone}
          onChange={(e) => setForm((p) => ({ ...p, emergency_contact_phone: e.target.value }))}
        />
      </label>
      <button type="submit" className="btn-primary">Save medical history</button>
    </form>
  );
}

export default function PatientProfilePage() {
  const { user, refreshUser, changePassword } = useAuth();

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
      await changePassword(passwordForm);
      setMessage('Password changed. Please log in again.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account and password" />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      <AvatarUploadSection
        user={user}
        onUpdated={refreshUser}
        onMessage={setMessage}
        onError={setError}
      />

      <ProfileDetailsForm
          key={user.id}
          user={user}
          refreshUser={refreshUser}
          onMessage={setMessage}
          onError={setError}
      />

      <MedicalHistoryForm
          key={`medical-${user.id}-${user.updated_at}`}
          user={user}
          refreshUser={refreshUser}
          onMessage={setMessage}
          onError={setError}
      />

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

      <p className="text-sm">
        <Link to="/patient/dashboard" className="text-sky-600">← Back to dashboard</Link>
      </p>
    </div>
  );
}

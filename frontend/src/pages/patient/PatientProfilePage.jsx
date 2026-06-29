import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import ErrorMessage from '../../components/common/ErrorMessage';
import AvatarUploadSection from '../../components/profile/AvatarUploadSection';
import EmailVerificationBanner from '../../components/patient/EmailVerificationBanner';
import { ProfileSkeleton } from '../../components/patient/PatientSkeletons';
import { authService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/formatters';
import { CIVIL_STATUS_OPTIONS, SEX_OPTIONS } from '../../utils/patientDemographics';

function ProfileDetailsForm({ user, refreshUser, onMessage, onError }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    date_of_birth: user.date_of_birth || '',
    sex: user.sex || '',
    civil_status: user.civil_status || '',
    address: user.address || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    onMessage('');
    try {
      await authService.updateMe({
        ...form,
        date_of_birth: form.date_of_birth || null,
      });
      await refreshUser();
      onMessage('Profile updated.');
    } catch (err) {
      onError(parseApiError(err));
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold text-clinic-heading">Personal information</h3>
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
      <p className="text-sm text-clinic-subtle">Email: {user.email}</p>
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
        <p className="text-sm text-clinic-body">Age: {user.age} years</p>
      )}
      <label className="label">
        Sex
        <select
          className="input"
          value={form.sex}
          onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value }))}
        >
          {SEX_OPTIONS.map((opt) => (
            <option key={opt.value || 'blank'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="label">
        Civil status
        <select
          className="input"
          value={form.civil_status}
          onChange={(e) => setForm((p) => ({ ...p, civil_status: e.target.value }))}
        >
          {CIVIL_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'blank'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="label">
        Address
        <textarea
          className="input min-h-[72px]"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          placeholder="Street, city, province..."
        />
      </label>
      <button type="submit" className="btn-primary">Save personal info</button>
    </form>
  );
}

function MedicalHistoryForm({ user, refreshUser, onMessage, onError }) {
  const [form, setForm] = useState({
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
      await authService.updateMe(form);
      await refreshUser();
      onMessage('Medical history updated.');
    } catch (err) {
      onError(parseApiError(err));
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold text-clinic-heading">Medical history</h3>
      <p className="text-sm text-clinic-subtle">
        Optional — helps our dentists prepare for your visit. You can update this anytime.
      </p>
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
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setError('New passwords do not match.');
      return;
    }
    try {
      await changePassword(passwordForm);
      setMessage('Password changed successfully.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />
      <EmailVerificationBanner user={user} />

      <AvatarUploadSection user={user} onUpdated={refreshUser} />

      <ProfileDetailsForm
        user={user}
        refreshUser={refreshUser}
        onMessage={setMessage}
        onError={setError}
      />

      <MedicalHistoryForm
        user={user}
        refreshUser={refreshUser}
        onMessage={setMessage}
        onError={setError}
      />

      <form className="card space-y-4" onSubmit={handlePasswordSubmit}>
        <h3 className="font-semibold text-clinic-heading">Change password</h3>
        {['current_password', 'new_password', 'new_password_confirm'].map((field) => (
          <label key={field} className="label capitalize">
            {field.replace(/_/g, ' ')}
            <input
              className="input"
              type="password"
              value={passwordForm[field]}
              onChange={(e) => setPasswordForm((p) => ({ ...p, [field]: e.target.value }))}
              required
            />
          </label>
        ))}
        <button type="submit" className="btn-primary">Update password</button>
      </form>

      <p className="text-sm text-clinic-subtle">
        Need help? <Link to="/patient/dashboard" className="text-clinic-500">Return to dashboard</Link>
      </p>
    </div>
  );
}

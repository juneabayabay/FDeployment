import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { parseApiError } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const { path } = useStaffPaths();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await changePassword(form);
      setMessage('Password changed successfully.');
      setForm({ current_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Change Password" subtitle="Update your account password" />
      {message && <div className="alert-success mb-4">{message}</div>}
      <form className="card space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        {Object.keys(form).map((field) => (
          <label key={field} className="label">
            {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            <input
              className="input"
              name={field}
              type="password"
              value={form[field]}
              onChange={handleChange}
              required
            />
          </label>
        ))}
        <button type="submit" className="btn-primary">Update password</button>
        <p className="text-sm">
          <Link to={path('/profile')} className="text-clinic-500">← Back to profile</Link>
        </p>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useUpdateUser, useUser, useResetUserPassword } from '../../hooks/useUsers';
import { parseApiError } from '../../utils/formatters';

export default function UserDetailPage() {
  const { id } = useParams();
  const { can } = usePermission();
  const { path } = useStaffPaths();
  const userQuery = useUser(id);
  const updateMutation = useUpdateUser();
  const resetPassword = useResetUserPassword();

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = userQuery.data;

  const current = form || (user ? {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
  } : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateMutation.mutateAsync({ id, data: current });
      setMessage('User updated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) return;
    setError('');
    setMessage('');
    try {
      const result = await resetPassword.mutateAsync(id);
      setMessage(result.data?.detail || 'Password reset email sent.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={user ? user.full_name || user.email : 'User'}
        subtitle={user?.role_slugs?.join(', ')}
        actions={<Link to={path('/users')} className="btn-ghost">← Back to users</Link>}
      />

      <QueryState
        isLoading={userQuery.isLoading}
        isError={userQuery.isError}
        error={userQuery.error}
        onRetry={() => userQuery.refetch()}
        isEmpty={!user && !userQuery.isLoading}
        emptyTitle="User not found."
      >
        {user && (
          <>
            <div className="card mb-6 max-w-lg">
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">Email</dt><dd>{user.email}</dd></div>
                <div><dt className="text-slate-500">Roles</dt><dd>{user.role_slugs?.join(', ')}</dd></div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd>{user.is_active ? 'Active' : 'Inactive'}</dd>
                </div>
              </dl>
              {can('users.update') && (
                <button
                  type="button"
                  className="btn-outline btn-sm mt-4"
                  onClick={handleResetPassword}
                  disabled={resetPassword.isPending}
                >
                  Send password reset email
                </button>
              )}
            </div>

            {can('users.update') && current && (
              <form className="card max-w-lg space-y-4" onSubmit={handleSubmit}>
                <h3 className="font-semibold text-slate-900">Edit user</h3>
                {message && <div className="alert-success">{message}</div>}
                <ErrorMessage message={error} />
                {['first_name', 'last_name', 'phone'].map((field) => (
                  <label key={field} className="label">
                    {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    <input
                      className="input"
                      value={current[field]}
                      onChange={(e) => setForm({ ...current, [field]: e.target.value })}
                    />
                  </label>
                ))}
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  Save changes
                </button>
              </form>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
}

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useDeleteUser, useUpdateUser, useUser, useResetUserPassword } from '../../hooks/useUsers';
import { ROLES } from '../../utils/constants';
import { parseApiError } from '../../utils/formatters';

const MANAGED_STAFF_ROLES = [ROLES.DENTIST, ROLES.RECEPTIONIST];

function canManageStaffAccount(actor, target) {
  if (!target || !actor) return false;
  if (target.id === actor.id) return false;
  if (target.role_slugs?.includes(ROLES.ADMIN)) return false;
  return target.role_slugs?.some((role) => MANAGED_STAFF_ROLES.includes(role));
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: actor } = useAuth();
  const { can } = usePermission();
  const { path } = useStaffPaths();
  const userQuery = useUser(id);
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const resetPassword = useResetUserPassword();

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = userQuery.data;
  const manageable = canManageStaffAccount(actor, user);

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

  const handleDeactivate = async () => {
    const label = user.full_name || user.email;
    if (!window.confirm(`Deactivate ${label}? They will no longer be able to log in.`)) return;
    setError('');
    setMessage('');
    try {
      await deleteMutation.mutateAsync(id);
      navigate(path('/users'), {
        replace: true,
        state: { message: `${label} has been deactivated.` },
      });
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
                <div><dt className="text-clinic-subtle">Email</dt><dd>{user.email}</dd></div>
                <div><dt className="text-clinic-subtle">Roles</dt><dd>{user.role_slugs?.join(', ')}</dd></div>
                <div>
                  <dt className="text-clinic-subtle">Status</dt>
                  <dd>{user.is_active ? 'Active' : 'Inactive'}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {can('users.update') && manageable && (
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={handleResetPassword}
                    disabled={resetPassword.isPending}
                  >
                    Send password reset email
                  </button>
                )}
                {can('users.delete') && manageable && user.is_active && (
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={handleDeactivate}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deactivating…' : 'Deactivate account'}
                  </button>
                )}
              </div>
              <ErrorMessage message={error} />
            </div>

            {can('users.update') && manageable && current && (
              <form className="card max-w-lg space-y-4" onSubmit={handleSubmit}>
                <h3 className="font-semibold text-clinic-heading">Edit user</h3>
                {message && <div className="alert-success">{message}</div>}
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

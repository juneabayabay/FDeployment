import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import UserForm from '../../components/users/UserForm';
import { useCreateUser } from '../../hooks/useUsers';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { ROLES } from '../../utils/constants';
import { parseApiError } from '../../utils/formatters';

const STAFF_ROLES = [
  { value: ROLES.RECEPTIONIST, label: 'Receptionist' },
  { value: ROLES.DENTIST, label: 'Dentist' },
];

export default function CreateStaffPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateUser();
  const { path } = useStaffPaths();

  const initialRole =
    searchParams.get('role') === ROLES.DENTIST ? ROLES.DENTIST : ROLES.RECEPTIONIST;

  const [roleSlug, setRoleSlug] = useState(initialRole);
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleLabel = STAFF_ROLES.find((r) => r.value === roleSlug)?.label || 'Staff';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createMutation.mutateAsync({ ...form, role_slug: roleSlug });
      setSuccess(`${roleLabel} account created successfully.`);
      setTimeout(() => navigate(path('/users')), 1500);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Staff Account"
        subtitle="Administrators can create dentist and receptionist login accounts"
      />

      <div className="card mb-6 max-w-lg">
        <label className="label">
          Staff role
          <select
            className="input"
            value={roleSlug}
            onChange={(e) => setRoleSlug(e.target.value)}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-sm text-slate-500">
          {roleSlug === ROLES.DENTIST
            ? 'Dentist accounts access the clinical portal at /dentist'
            : 'Receptionist accounts access the front desk portal at /receptionist'}
        </p>
      </div>

      {success && <div className="alert-success mb-4">{success}</div>}

      <UserForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={`Create ${roleLabel.toLowerCase()}`}
        loading={createMutation.isPending}
        error={error}
      />
    </div>
  );
}

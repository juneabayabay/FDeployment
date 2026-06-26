import { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import Pagination from '../../components/common/Pagination';
import {
  usePatients,
  useCreatePatient,
  useDeletePatient,
} from '../../hooks/usePatients';
import { useListPage, useResetPageOnChange, usePaginatedData } from '../../hooks/usePaginatedList';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { parseApiError } from '../../utils/formatters';
import Avatar from '../../components/common/Avatar';
import { ROLES } from '../../utils/constants';

const emptyForm = {
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
  password_confirm: '',
};

export default function PatientListPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { can } = usePermission();
  const { path } = useStaffPaths();

  const { page, setPage } = useListPage();
  const searchTerm = search.trim() || undefined;
  useResetPageOnChange(page, setPage, searchTerm);

  const patients = usePatients({ search: searchTerm, page });
  const { results: rows, totalPages } = usePaginatedData(patients.data);
  const createMutation = useCreatePatient();
  const deleteMutation = useDeletePatient();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createMutation.mutateAsync({
        ...form,
        username: form.username || form.email,
      });
      setMessage('Patient registered successfully.');
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this patient account?')) return;
    setError('');
    try {
      await deleteMutation.mutateAsync(id);
      setMessage('Patient deactivated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            user={{
              ...row,
              role_slugs: row.role_slugs?.length ? row.role_slugs : [ROLES.USER],
            }}
            size="sm"
          />
          <span>{row.full_name || `${row.first_name} ${row.last_name}`.trim() || '—'}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-3">
          <Link to={path(`/patients/${row.id}`)} className="text-sm text-sky-600 hover:text-sky-800">
            View
          </Link>
          {can('patients.delete') && (
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-800"
              onClick={() => handleDelete(row.id)}
              disabled={deleteMutation.isPending}
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Search patient records"
        actions={
          can('patients.create') ? (
            <button type="button" className="btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close form' : '+ Register patient'}
            </button>
          ) : null
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      {showForm && can('patients.create') && (
        <form onSubmit={handleCreate} className="card grid gap-4 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-lg font-semibold text-slate-900">Register new patient</h2>
          {['first_name', 'last_name', 'email', 'phone'].map((field) => (
            <label key={field} className="label capitalize">
              {field.replace('_', ' ')}
              <input
                className="input"
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={field === 'email' || field === 'first_name'}
              />
            </label>
          ))}
          <label className="label">
            Password
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          <label className="label">
            Confirm password
            <input
              type="password"
              className="input"
              value={form.password_confirm}
              onChange={(e) => setForm((f) => ({ ...f, password_confirm: e.target.value }))}
              required
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Register patient
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <label className="label">
          Search
          <input
            type="search"
            className="input max-w-md"
            placeholder="Name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <QueryState
        isLoading={patients.isLoading}
        isError={patients.isError}
        error={patients.error}
        onRetry={() => patients.refetch()}
      >
        <DataTable columns={columns} rows={rows} emptyMessage="No patients found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </QueryState>
    </div>
  );
}

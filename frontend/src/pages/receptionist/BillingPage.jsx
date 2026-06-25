import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import StaffBillingCard from '../../components/staff/StaffBillingCard';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import Pagination from '../../components/common/Pagination';
import { useStaffBilling, useCreateStaffBilling, useUpdateStaffBilling } from '../../hooks/useStaffBilling';
import { usePatientList } from '../../hooks/usePatients';
import { useListPage, useResetPageOnChange, usePaginatedData } from '../../hooks/usePaginatedList';
import { PAYMENT_STATUS_FILTERS } from '../../utils/constants';
import { formatDate, formatPrice, parseApiError } from '../../utils/formatters';
import { getPaymentStatusLabel } from '../../utils/appointmentStatus';

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid'];

export default function BillingPage() {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient_id: '',
    description: '',
    total_amount: '',
    amount_paid: '0',
    payment_method: 'cash',
  });

  const { page, setPage } = useListPage();
  useResetPageOnChange(page, setPage, paymentStatus, search);

  const params = {
    page,
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  const billing = useStaffBilling(params);
  const { results: rows, totalPages } = usePaginatedData(billing.data);
  const patients = usePatientList();
  const createMutation = useCreateStaffBilling();
  const updateMutation = useUpdateStaffBilling();
  const totalOutstanding = rows.reduce((sum, r) => sum + Number(r.balance), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createMutation.mutateAsync({
        patient_id: Number(form.patient_id),
        description: form.description,
        total_amount: form.total_amount,
        amount_paid: form.amount_paid || '0',
        payment_method: form.payment_method,
      });
      setMessage('Billing record created.');
      setShowForm(false);
      setForm({ patient_id: '', description: '', total_amount: '', amount_paid: '0', payment_method: 'cash' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handlePaymentUpdate = async (id, field, value) => {
    setError('');
    try {
      await updateMutation.mutateAsync({ id, data: { [field]: value } });
      setMessage('Billing record updated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => row.patient?.full_name || row.patient?.email || '—',
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.appointment_date
          ? formatDate(row.appointment_date)
          : formatDate(row.created_at?.slice(0, 10)),
    },
    { key: 'description', label: 'Description' },
    {
      key: 'payment_method',
      label: 'Method',
      render: (row) => (row.payment_method ? row.payment_method.toUpperCase() : '—'),
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => formatPrice(row.total_amount),
    },
    {
      key: 'paid',
      label: 'Paid',
      render: (row) => (
        <input
          type="number"
          min="0"
          step="0.01"
          className="input w-24 py-1 text-xs"
          defaultValue={row.amount_paid}
          onBlur={(e) => {
            const val = e.target.value;
            if (val !== String(row.amount_paid)) {
              handlePaymentUpdate(row.id, 'amount_paid', val);
            }
          }}
        />
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (row) => formatPrice(row.balance),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <select
          className="input w-auto py-1 text-xs"
          value={row.payment_status}
          onChange={(e) => handlePaymentUpdate(row.id, 'payment_status', e.target.value)}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getPaymentStatusLabel(s)}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Desk"
        subtitle="Manage patient billing and payments"
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close form' : '+ New record'}
          </button>
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      <div className="patient-hero">
        <p className="text-sm text-sky-100">Outstanding balance (filtered)</p>
        <p className="text-3xl font-bold">{formatPrice(totalOutstanding)}</p>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid gap-4 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-lg font-semibold text-slate-900">New billing record</h2>
          <label className="label">
            Patient
            <select
              className="input"
              value={form.patient_id}
              onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
              required
            >
              <option value="">Choose patient...</option>
              {(patients.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Description
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </label>
          <label className="label">
            Total amount
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.total_amount}
              onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
              required
            />
          </label>
          <label className="label">
            Amount paid
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.amount_paid}
              onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))}
            />
          </label>
          <label className="label">
            Payment method
            <select
              className="input"
              value={form.payment_method}
              onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Create record
            </button>
          </div>
        </form>
      )}

      <div className="card grid gap-4 sm:grid-cols-2">
        <label className="label">
          Payment status
          <select
            className="input"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Search patient
          <input
            type="search"
            className="input"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <QueryState
        isLoading={billing.isLoading}
        isError={billing.isError}
        error={billing.error}
        onRetry={() => billing.refetch()}
      >
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No billing records found."
          renderMobileCard={(row) => (
            <StaffBillingCard
              record={row}
              onPaymentUpdate={handlePaymentUpdate}
              updating={updateMutation.isPending}
            />
          )}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </QueryState>
    </div>
  );
}

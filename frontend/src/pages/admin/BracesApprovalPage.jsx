import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import {
  useDownPayments,
  useCreateDownPayment,
  useApproveDownPayment,
  useRejectDownPayment,
} from '../../hooks/useDownPayments';
import { usePatientList } from '../../hooks/usePatients';
import { usePermission } from '../../hooks/usePermission';
import { formatDate, formatPrice, parseApiError } from '../../utils/formatters';

export default function BracesApprovalPage() {
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', amount: '', description: '' });
  const { can } = usePermission();

  const records = useDownPayments({ status: status || undefined });
  const patients = usePatientList();
  const create = useCreateDownPayment();
  const approve = useApproveDownPayment();
  const reject = useRejectDownPayment();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await create.mutateAsync(form);
      setMessage('Down payment request submitted.');
      setShowForm(false);
      setForm({ patient_id: '', amount: '', description: '' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this down payment and create billing record?')) return;
    setError('');
    try {
      await approve.mutateAsync(id);
      setMessage('Down payment approved.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    setError('');
    try {
      await reject.mutateAsync({ id, reason });
      setMessage('Down payment rejected.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => r.patient?.full_name || r.patient?.email,
    },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    { key: 'amount', label: 'Amount', render: (r) => formatPrice(r.amount) },
    { key: 'status', label: 'Status', render: (r) => r.status },
    {
      key: 'date',
      label: 'Submitted',
      render: (r) => formatDate(r.created_at?.slice(0, 10)),
    },
    ...(can('billing.approve')
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (r) =>
              r.status === 'pending' ? (
                <div className="flex gap-2">
                  <button type="button" className="btn-primary btn-sm" onClick={() => handleApprove(r.id)}>
                    Approve
                  </button>
                  <button type="button" className="btn-danger btn-sm" onClick={() => handleReject(r.id)}>
                    Reject
                  </button>
                </div>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Braces Down Payment Approvals"
        subtitle="Review and approve orthodontic down payment requests"
        actions={
          can('billing.create') ? (
            <button type="button" className="btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close' : '+ New request'}
            </button>
          ) : null
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      {showForm && (
        <form onSubmit={handleCreate} className="card grid gap-4 sm:grid-cols-2">
          <label className="label">
            Patient
            <select className="input" value={form.patient_id} onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))} required>
              <option value="">Choose...</option>
              {(patients.data || []).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
              ))}
            </select>
          </label>
          <label className="label">
            Amount
            <input type="number" step="0.01" className="input" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </label>
          <label className="label sm:col-span-2">
            Description
            <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <button type="submit" className="btn-primary btn-sm sm:col-span-2">Submit request</button>
        </form>
      )}

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${status === s ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}
            onClick={() => setStatus(s)}
          >
            {s || 'all'}
          </button>
        ))}
      </div>

      <QueryState isLoading={records.isLoading} isError={records.isError} error={records.error} onRetry={() => records.refetch()}>
        <DataTable columns={columns} rows={records.data || []} emptyMessage="No down payment requests." />
      </QueryState>
    </div>
  );
}

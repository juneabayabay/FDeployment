import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import StaffAppointmentCard from '../../components/staff/StaffAppointmentCard';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import Pagination from '../../components/common/Pagination';
import {
  useStaffAppointments,
  useCancelStaffAppointment,
  useUpdateStaffAppointment,
} from '../../hooks/useStaffAppointments';
import { useListPage, useResetPageOnChange, usePaginatedData } from '../../hooks/usePaginatedList';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { APPOINTMENT_STATUS_FILTERS } from '../../utils/constants';
import { formatDate, formatPrice, formatTime, parseApiError } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';

const STATUS_OPTIONS = [
  'pending',
  'pencil_booked',
  'confirmed',
  'completed',
  'no_show',
];

export default function AppointmentsPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const { path } = useStaffPaths();

  const { page, setPage } = useListPage();
  useResetPageOnChange(page, setPage, date, status, search);

  const params = {
    page,
    ...(date ? { date } : {}),
    ...(status ? { status } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  const appointments = useStaffAppointments(params);
  const { results: rows, totalPages } = usePaginatedData(appointments.data);
  const cancelMutation = useCancelStaffAppointment();
  const updateMutation = useUpdateStaffAppointment();

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    try {
      await cancelMutation.mutateAsync(id);
      setMessage('Appointment cancelled.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setError('');
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
      setMessage('Appointment updated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => formatDate(row.appointment_date),
    },
    {
      key: 'time',
      label: 'Time',
      render: (row) => `${formatTime(row.start_time)} – ${formatTime(row.end_time)}`,
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => row.patient?.full_name || row.patient?.email || '—',
    },
    {
      key: 'procedures',
      label: 'Procedures',
      render: (row) => (row.procedures || []).map((p) => p.name).join(', ') || '—',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => formatPrice(row.total_amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${getStatusBadgeClass(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <>
              <select
                className="input w-auto py-1 text-xs"
                value={row.status}
                onChange={(e) => handleStatusChange(row.id, e.target.value)}
                disabled={updateMutation.isPending}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => handleCancel(row.id)}
                disabled={cancelMutation.isPending}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage all clinic appointments"
        actions={
          <Link to={path('/appointments/book')} className="btn-primary btn-sm">
            + Book appointment
          </Link>
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      <div className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="label">
          Date
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="label">
          Status
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {APPOINTMENT_STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="label sm:col-span-2">
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
        isLoading={appointments.isLoading}
        isError={appointments.isError}
        error={appointments.error}
        onRetry={() => appointments.refetch()}
      >
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No appointments match your filters."
          renderMobileCard={(row) => (
            <StaffAppointmentCard
              appointment={row}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
              updating={updateMutation.isPending}
              cancelling={cancelMutation.isPending}
            />
          )}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </QueryState>
    </div>
  );
}

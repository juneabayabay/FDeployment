import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import Pagination from '../../components/common/Pagination';
import {
  useStaffWaitingList,
  useDeactivateStaffWaitingList,
  useBookStaffWaitingList,
} from '../../hooks/useStaffAppointments';
import { useListPage, useResetPageOnChange, usePaginatedData } from '../../hooks/usePaginatedList';
import { usePermission } from '../../hooks/usePermission';
import { formatDate, parseApiError } from '../../utils/formatters';

export default function WaitingListPage() {
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookEntry, setBookEntry] = useState(null);
  const [bookForm, setBookForm] = useState({
    appointment_date: '',
    start_time: '',
    booking_type: 'pencil',
  });
  const { can } = usePermission();

  const { page, setPage } = useListPage();
  const searchTerm = search.trim() || undefined;
  useResetPageOnChange(page, setPage, searchTerm);

  const entries = useStaffWaitingList({ page, ...(searchTerm ? { search: searchTerm } : {}) });
  const { results: entryRows, totalPages } = usePaginatedData(entries.data);
  const deactivate = useDeactivateStaffWaitingList();
  const book = useBookStaffWaitingList();

  const handleDeactivate = async (id) => {
    if (!window.confirm('Remove this patient from the waiting list?')) return;
    setError('');
    try {
      await deactivate.mutateAsync(id);
      setMessage('Waiting list entry removed.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await book.mutateAsync({ id: bookEntry.id, data: bookForm });
      setMessage('Appointment booked from waiting list.');
      setBookEntry(null);
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
      key: 'contact',
      label: 'Contact',
      render: (row) => row.patient?.phone || row.patient?.email || '—',
    },
    {
      key: 'preferred_date',
      label: 'Preferred date',
      render: (row) => (row.preferred_date ? formatDate(row.preferred_date) : 'Any'),
    },
    {
      key: 'procedures',
      label: 'Procedures',
      render: (row) => (row.procedures || []).map((p) => p.name).join(', ') || '—',
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (row) => row.notes || '—',
    },
    {
      key: 'created',
      label: 'Joined',
      render: (row) => formatDate(row.created_at?.slice(0, 10)),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {can('appointments.create') && (
            <button type="button" className="btn-primary btn-sm" onClick={() => setBookEntry(row)}>
              Book slot
            </button>
          )}
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => handleDeactivate(row.id)}
            disabled={deactivate.isPending}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waiting List"
        subtitle="Patients waiting for an available appointment slot"
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      {bookEntry && (
        <form onSubmit={handleBook} className="card grid gap-4 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-lg font-semibold">
            Book slot for {bookEntry.patient?.full_name || bookEntry.patient?.email}
          </h2>
          <p className="sm:col-span-2 text-sm text-slate-500">
            Procedures: {(bookEntry.procedures || []).map((p) => p.name).join(', ')}
          </p>
          <label className="label">
            Date
            <input
              type="date"
              className="input"
              value={bookForm.appointment_date}
              onChange={(e) => setBookForm((f) => ({ ...f, appointment_date: e.target.value }))}
              required
            />
          </label>
          <label className="label">
            Start time
            <input
              type="time"
              className="input"
              value={bookForm.start_time}
              onChange={(e) => setBookForm((f) => ({ ...f, start_time: e.target.value }))}
              required
            />
          </label>
          <label className="label">
            Booking type
            <select
              className="input"
              value={bookForm.booking_type}
              onChange={(e) => setBookForm((f) => ({ ...f, booking_type: e.target.value }))}
            >
              <option value="pencil">Pencil</option>
              <option value="paid">Paid / Confirmed</option>
            </select>
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary btn-sm" disabled={book.isPending}>
              Confirm booking
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setBookEntry(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <label className="label">
          Search patient
          <input
            type="search"
            className="input max-w-md"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <QueryState
        isLoading={entries.isLoading}
        isError={entries.isError}
        error={entries.error}
        onRetry={() => entries.refetch()}
      >
        <DataTable
          columns={columns}
          rows={entryRows}
          emptyMessage="No active waiting list entries."
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </QueryState>
    </div>
  );
}

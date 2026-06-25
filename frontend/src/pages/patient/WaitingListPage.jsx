import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import WaitingListForm from '../../components/patient/WaitingListForm';
import WaitingListPanel from '../../components/patient/WaitingListPanel';
import ErrorMessage from '../../components/common/ErrorMessage';
import {
  useProcedures,
  useWaitingList,
  useJoinWaitingList,
  useLeaveWaitingList,
} from '../../hooks/useAppointments';
import { parseApiError } from '../../utils/formatters';

export default function WaitingListPage() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const entries = useWaitingList();
  const procedures = useProcedures();
  const join = useJoinWaitingList();
  const leave = useLeaveWaitingList();

  const handleJoin = async (data) => {
    setError('');
    try {
      await join.mutateAsync(data);
      setMessage('Added to waiting list. We will notify you when a slot opens.');
      setShowForm(false);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waiting List"
        subtitle="Get notified when an appointment slot becomes available"
        actions={
          !showForm && (
            <button type="button" className="btn-primary btn-sm" onClick={() => setShowForm(true)}>
              + Join waiting list
            </button>
          )
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      {showForm && (
        <QueryState
          isLoading={procedures.isLoading}
          isError={procedures.isError}
          error={procedures.error}
          onRetry={() => procedures.refetch()}
        >
          <WaitingListForm
            procedures={procedures.data || []}
            onSubmit={handleJoin}
            onCancel={() => setShowForm(false)}
            loading={join.isPending}
          />
        </QueryState>
      )}

      <QueryState
        isLoading={entries.isLoading}
        isError={entries.isError}
        error={entries.error}
        onRetry={() => entries.refetch()}
      >
        <WaitingListPanel
          entries={entries.data || []}
          onLeave={(id) => leave.mutate(id)}
          leavingId={leave.isPending ? leave.variables : null}
        />
      </QueryState>
    </div>
  );
}

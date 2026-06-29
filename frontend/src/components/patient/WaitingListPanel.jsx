import { formatDate } from '../../utils/formatters';

export default function WaitingListPanel({ entries, onLeave, leavingId }) {
  return (
    <section className="card">
      <h2 className="mb-4 text-lg font-semibold text-clinic-heading">Your entries</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-clinic-subtle">You are not on the waiting list.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                entry.is_suggested || entry.suggested_for_date
                  ? 'border-clinic-300 bg-clinic-50'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div>
                <p>
                  {entry.preferred_date ? formatDate(entry.preferred_date) : 'Any date'} — joined{' '}
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
                {(entry.is_suggested || entry.suggested_for_date) && (
                  <p className="mt-1 text-xs font-medium text-clinic-700">
                    You may be contacted for an open slot
                    {entry.suggested_for_date
                      ? ` on ${formatDate(entry.suggested_for_date)}`
                      : ''}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn-ghost btn-sm text-red-600"
                onClick={() => onLeave(entry.id)}
                disabled={leavingId === entry.id}
              >
                Leave
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

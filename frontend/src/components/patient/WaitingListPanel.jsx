import { formatDate } from '../../utils/formatters';

export default function WaitingListPanel({ entries, onLeave, leavingId }) {
  return (
    <section className="card">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Your entries</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">You are not on the waiting list.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
            >
              <span>
                {entry.preferred_date ? formatDate(entry.preferred_date) : 'Any date'} — joined{' '}
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
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

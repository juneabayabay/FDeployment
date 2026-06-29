import { formatDateTime } from '../../utils/formatters';

export default function NotificationList({ notifications, onMarkRead, onMarkAllRead, marking }) {
  if (!notifications.length) {
    return <p className="text-sm text-clinic-subtle">No notifications yet.</p>;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <button type="button" className="btn-outline btn-sm" onClick={onMarkAllRead} disabled={marking}>
          Mark all as read ({unreadCount})
        </button>
      )}
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 ${
              n.is_read ? 'border-slate-100 bg-white' : 'border-clinic-200 bg-clinic-50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong className="text-clinic-heading">{n.title}</strong>
                <p className="mt-1 text-sm text-clinic-body">{n.message}</p>
                <small className="mt-2 block text-xs text-clinic-muted">{formatDateTime(n.created_at)}</small>
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  className="btn-ghost btn-sm shrink-0"
                  onClick={() => onMarkRead(n.id)}
                  disabled={marking}
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

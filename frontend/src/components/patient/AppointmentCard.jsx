import { formatDate, formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';
import PencilCountdown from './PencilCountdown';

export default function AppointmentCard({ appointment, onCancel, onReschedule, cancelling, showActions = true }) {
  return (
    <article className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
          <h3 className="mt-2 font-semibold text-slate-900">
            {formatDate(appointment.appointment_date)} at {formatTime(appointment.start_time)}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {appointment.procedures?.map((p) => p.name).join(', ')}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatPrice(appointment.total_amount)} · {formatDuration(appointment.total_duration_minutes)}
          </p>
          {appointment.pencil_expires_at && (
            <div className="mt-2">
              <PencilCountdown expiresAt={appointment.pencil_expires_at} />
            </div>
          )}
        </div>
        {showActions && (
        <div className="flex gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={onReschedule}>
            Reschedule
          </button>
          <button type="button" className="btn-danger btn-sm" onClick={onCancel} disabled={cancelling}>
            Cancel
          </button>
        </div>
        )}
      </div>
    </article>
  );
}

export function AppointmentHistoryItem({ appointment }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
      <span className="text-slate-700">{formatDate(appointment.appointment_date)}</span>
      <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
        {getStatusLabel(appointment.status)}
      </span>
      <span className="text-slate-600">{appointment.procedures?.map((p) => p.name).join(', ')}</span>
    </li>
  );
}

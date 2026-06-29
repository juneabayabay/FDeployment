import { formatDate, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel, getBookingSourceLabel, getBookingSourceBadgeClass } from '../../utils/appointmentStatus';
import AppointmentParticipants from '../appointments/AppointmentParticipants';

const STATUS_OPTIONS = ['pending', 'pencil_booked', 'confirmed', 'completed', 'no_show'];

export default function StaffAppointmentCard({
  appointment,
  onStatusChange,
  onCancel,
  updating,
  cancelling,
}) {
  const canAct =
    appointment.status !== 'cancelled' && appointment.status !== 'completed';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AppointmentParticipants
            patient={appointment.patient}
            dentist={appointment.dentist}
          />
          <p className="mt-3 text-sm text-slate-600">
            {formatDate(appointment.appointment_date)} · {formatTime(appointment.start_time)} –{' '}
            {formatTime(appointment.end_time)}
          </p>
        </div>
        <span className={`badge shrink-0 ${getStatusBadgeClass(appointment.status)}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      {appointment.booking_source && appointment.booking_source !== 'online' && (
        <span className={`badge mt-2 ${getBookingSourceBadgeClass(appointment.booking_source)}`}>
          {getBookingSourceLabel(appointment.booking_source)}
        </span>
      )}

      <p className="mt-2 text-sm text-slate-600">
        {(appointment.procedures || []).map((p) => p.name).join(', ') || '—'}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{formatPrice(appointment.total_amount)}</p>

      {canAct && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <label className="label">
            Update status
            <select
              className="input"
              value={appointment.status}
              disabled={updating}
              onChange={(e) => onStatusChange(appointment.id, e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-danger w-full"
            onClick={() => onCancel(appointment.id)}
            disabled={cancelling}
          >
            Cancel appointment
          </button>
        </div>
      )}
    </article>
  );
}

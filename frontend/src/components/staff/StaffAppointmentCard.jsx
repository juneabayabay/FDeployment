import { formatDate, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel, getBookingSourceLabel, getBookingSourceBadgeClass } from '../../utils/appointmentStatus';
import AppointmentParticipants from '../appointments/AppointmentParticipants';
import StaffReschedulePanel from './StaffReschedulePanel';
import {
  STAFF_STATUS_OPTIONS,
  canActOnAppointment,
  canRescheduleAppointment,
} from '../../utils/staffAppointments';

export default function StaffAppointmentCard({
  appointment,
  onStatusChange,
  onComplete,
  onCancel,
  onReschedule,
  onRescheduleSuccess,
  onRescheduleCancel,
  rescheduling,
  updating,
  cancelling,
  completing,
}) {
  const canAct = canActOnAppointment(appointment);
  const showReschedule = canRescheduleAppointment(appointment);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AppointmentParticipants
            patient={appointment.patient}
            dentist={appointment.dentist}
          />
          <p className="mt-3 text-sm text-clinic-body">
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

      <p className="mt-2 text-sm text-clinic-body">
        {(appointment.procedures || []).map((p) => p.name).join(', ') || '—'}
      </p>
      <p className="mt-1 text-sm font-medium text-clinic-heading">{formatPrice(appointment.total_amount)}</p>

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
              {STAFF_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </label>

          {appointment.can_complete && (
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => onComplete(appointment.id)}
              disabled={completing}
            >
              Mark complete
            </button>
          )}

          {showReschedule && !rescheduling && (
            <button
              type="button"
              className="btn-outline w-full"
              onClick={() => onReschedule(appointment.id)}
            >
              Reschedule
            </button>
          )}

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

      {rescheduling && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <StaffReschedulePanel
            appointment={appointment}
            onSuccess={onRescheduleSuccess}
            onCancel={onRescheduleCancel}
          />
        </div>
      )}
    </article>
  );
}

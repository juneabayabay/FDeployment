import { formatDate, formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';
import AppointmentParticipants from '../appointments/AppointmentParticipants';
import PencilCountdown from './PencilCountdown';

const ACTIVE_FOR_ACTIONS = new Set(['pending', 'pencil_booked', 'pencil', 'confirmed']);

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  cancelling,
  showActions = true,
}) {
  const canManage = ACTIVE_FOR_ACTIONS.has(appointment.status);

  return (
    <article className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
          <h3 className="mt-2 text-base font-semibold text-clinic-heading sm:text-lg">
            {formatDate(appointment.appointment_date)} at {formatTime(appointment.start_time)}
          </h3>
          <div className="mt-3">
            <AppointmentParticipants dentist={appointment.dentist} showPatient={false} />
          </div>
          <p className="text-body mt-3">
            {appointment.procedures?.map((p) => p.name).join(', ')}
          </p>
          <p className="text-caption mt-1">
            {formatPrice(appointment.total_amount)} · {formatDuration(appointment.total_duration_minutes)}
          </p>
          {appointment.pencil_expires_at && (
            <div className="mt-2">
              <PencilCountdown expiresAt={appointment.pencil_expires_at} />
            </div>
          )}
        </div>
        {showActions && canManage && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:flex-col lg:items-stretch xl:flex-row">
            <button type="button" className="btn-outline btn-sm w-full sm:w-auto" onClick={onReschedule}>
              Reschedule
            </button>
            <button
              type="button"
              className="btn-danger btn-sm w-full sm:w-auto"
              onClick={onCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function AppointmentHistoryItem({ appointment }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-clinic-100 bg-white px-4 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <span className="font-medium text-clinic-heading">{formatDate(appointment.appointment_date)}</span>
      <span className={`badge w-fit ${getStatusBadgeClass(appointment.status)}`}>
        {getStatusLabel(appointment.status)}
      </span>
      <AppointmentParticipants dentist={appointment.dentist} showPatient={false} compact />
      <span className="text-body min-w-0 flex-1">
        {appointment.procedures?.map((p) => p.name).join(', ')}
      </span>
    </li>
  );
}

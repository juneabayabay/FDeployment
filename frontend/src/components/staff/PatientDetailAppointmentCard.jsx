import { formatDate, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';
import AppointmentParticipants from '../appointments/AppointmentParticipants';

export default function PatientDetailAppointmentCard({ appointment }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{formatDate(appointment.appointment_date)}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
          </p>
          <div className="mt-3">
            <AppointmentParticipants
              dentist={appointment.dentist}
              showPatient={false}
              compact
            />
          </div>
        </div>
        <span className={`badge shrink-0 ${getStatusBadgeClass(appointment.status)}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {(appointment.procedures || []).map((p) => p.name).join(', ') || '—'}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500">Amount</span>
          <p className="font-medium text-slate-900">{formatPrice(appointment.total_amount)}</p>
        </div>
        <div>
          <span className="text-slate-500">Cancel fee</span>
          <p className="font-medium text-slate-900">
            {appointment.cancellation_fee ? formatPrice(appointment.cancellation_fee) : '—'}
          </p>
        </div>
      </div>
    </article>
  );
}

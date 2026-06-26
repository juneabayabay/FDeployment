import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useStaffSchedule } from '../../hooks/useStaffAppointments';
import AppointmentParticipants from '../../components/appointments/AppointmentParticipants';
import { formatDate, formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';
import { toApiDate } from '../../utils/clinicDates';

function shiftDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = toApiDate(selectedDate);
  const { path } = useStaffPaths();
  const schedule = useStaffSchedule(dateStr);
  const appointments = schedule.data?.appointments || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Schedule"
        subtitle="Today's clinic appointments at a glance"
        actions={
          <Link to={path('/appointments/book')} className="btn-primary btn-sm">
            + Book appointment
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
        >
          ← Previous
        </button>
        <input
          type="date"
          className="input w-auto"
          value={dateStr}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-').map(Number);
            setSelectedDate(new Date(y, m - 1, d));
          }}
        />
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </button>
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
        >
          Next →
        </button>
        <span className="text-sm text-slate-500">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <QueryState
        isLoading={schedule.isLoading}
        isError={schedule.isError}
        error={schedule.error}
        isEmpty={appointments.length === 0}
        emptyTitle="No appointments scheduled"
        emptyDescription={`No active appointments on ${formatDate(dateStr)}.`}
        onRetry={() => schedule.refetch()}
        emptyAction={
          <Link to={path('/appointments/book')} className="btn-primary btn-sm">
            Book appointment
          </Link>
        }
      >
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-[5rem] text-center">
                  <p className="text-lg font-bold text-sky-700">{formatTime(appt.start_time)}</p>
                  <p className="text-xs text-slate-500">{formatDuration(appt.total_duration_minutes)}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <AppointmentParticipants patient={appt.patient} dentist={appt.dentist} />
                  <p className="text-sm text-slate-500">
                    {(appt.procedures || []).map((p) => p.name).join(', ') || 'No procedures'}
                  </p>
                  <p className="text-sm text-slate-500">{formatPrice(appt.total_amount)}</p>
                </div>
              </div>
              <span className={`badge self-start ${getStatusBadgeClass(appt.status)}`}>
                {getStatusLabel(appt.status)}
              </span>
            </div>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

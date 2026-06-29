import { useMemo, useState } from 'react';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/appointmentStatus';
import { formatDate, formatTime } from '../../utils/formatters';
import { toApiDate } from '../../utils/clinicDates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT = {
  confirmed: 'bg-emerald-500',
  pencil_booked: 'bg-amber-500',
  pencil: 'bg-amber-500',
  pending: 'bg-clinic-400',
  cancelled: 'bg-slate-400',
  completed: 'bg-clinic-500',
  no_show: 'bg-red-400',
};

function dateKey(year, month, day) {
  return toApiDate(new Date(year, month, day));
}

export default function AppointmentMonthView({ appointments = [], onDateClick, selectedDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [pickedDay, setPickedDay] = useState(null);

  const apptsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const key = a.appointment_date;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [appointments]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setPickedDay(null);
  };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setPickedDay(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setPickedDay(day);
    const date = new Date(viewYear, viewMonth, day);
    onDateClick?.(date);
  };

  const pickedKey = pickedDay ? dateKey(viewYear, viewMonth, pickedDay) : null;
  const pickedAppts = pickedKey ? apptsByDate[pickedKey] || [] : [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="btn-ghost btn-sm" onClick={goPrev} aria-label="Previous month">
            ‹
          </button>
          <span className="font-medium text-clinic-heading">{monthLabel}</span>
          <button type="button" className="btn-ghost btn-sm" onClick={goNext} aria-label="Next month">
            ›
          </button>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-clinic-subtle">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} className="h-12" />;

            const key = dateKey(viewYear, viewMonth, day);
            const dayAppts = apptsByDate[key] || [];
            const isSelected =
              selectedDate &&
              selectedDate.getFullYear() === viewYear &&
              selectedDate.getMonth() === viewMonth &&
              selectedDate.getDate() === day;
            const isPicked = pickedDay === day;
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  isSelected || isPicked
                    ? 'bg-clinic-500 text-white'
                    : isToday
                      ? 'bg-clinic-50 text-clinic-700 ring-1 ring-clinic-200'
                      : 'text-clinic-body hover:bg-slate-100'
                }`}
              >
                <span className="font-medium">{day}</span>
                {dayAppts.length > 0 && (
                  <span className="mt-0.5 flex gap-0.5">
                    {dayAppts.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected || isPicked
                            ? 'bg-white'
                            : STATUS_DOT[a.status] || 'bg-clinic-400'
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {pickedDay && (
        <div className="card">
          <h3 className="mb-3 font-semibold text-clinic-heading">
            {formatDate(pickedKey)}
          </h3>
          {pickedAppts.length === 0 ? (
            <p className="text-sm text-clinic-subtle">No appointments on this day.</p>
          ) : (
            <ul className="space-y-2">
              {pickedAppts.map((a) => (
                <li key={a.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadgeClass(a.status)}`}>
                      {getStatusLabel(a.status)}
                    </span>
                    <span className="font-medium">{formatTime(a.start_time)}</span>
                  </div>
                  <p className="mt-1 text-clinic-body">
                    {a.procedures?.map((p) => p.name).join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-clinic-body">
        {[
          ['Confirmed', 'bg-emerald-500'],
          ['Pencil', 'bg-amber-500'],
          ['Completed', 'bg-clinic-500'],
          ['Cancelled', 'bg-slate-400'],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

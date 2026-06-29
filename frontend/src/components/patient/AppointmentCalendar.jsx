import { useMemo, useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isPastDate(year, month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(year, month, day);
  return d < today;
}

function isSunday(year, month, day) {
  return new Date(year, month, day).getDay() === 0;
}

export default function AppointmentCalendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

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
  };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleSelect = (day) => {
    if (!day) return;
    if (isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day)) return;
    onSelectDate(new Date(viewYear, viewMonth, day));
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day) => {
    if (!day) return false;
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isDisabled = (day) => {
    if (!day) return true;
    return isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day);
  };

  return (
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
        {days.map((day, i) => (
          <button
            key={i}
            type="button"
            className={`h-9 rounded-lg text-sm transition-colors ${
              !day
                ? 'invisible'
                : isDisabled(day)
                  ? 'cursor-not-allowed text-slate-300'
                  : isSelected(day)
                    ? 'bg-clinic-500 font-semibold text-white'
                    : isToday(day)
                      ? 'bg-clinic-100 font-medium text-clinic-700 hover:bg-clinic-200'
                      : 'text-clinic-body hover:bg-slate-100'
            }`}
            onClick={() => handleSelect(day)}
            disabled={!day || isDisabled(day)}
          >
            {day || ''}
          </button>
        ))}
      </div>
    </div>
  );
}

import { formatDurationShort, formatPrice, formatTime } from '../../utils/formatters';

export default function TimeSlotPicker({
  totalDurationMinutes,
  selectedDate,
  selectedProcedures,
  slots,
  slotsMessage,
  dailyFull,
  loading,
  pencilHours,
  totalAmount,
  booking,
  onBook,
  onRefresh,
  mode = 'book',
  onSelectSlot,
  autoMatchLabel,
}) {
  const procedureLabel = selectedProcedures.map((p) => p.name).join(', ');
  const durationLabel = autoMatchLabel || formatDurationShort(totalDurationMinutes);

  if (!totalDurationMinutes) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-clinic-subtle">
        Select a procedure above — compatible times will appear here automatically.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-clinic-subtle">
        Finding compatible times for your {durationLabel} appointment…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-clinic-body">
          Auto-matched · {durationLabel} · {pencilHours}hr pencil booking
        </p>
        <button type="button" className="btn-ghost btn-sm shrink-0 self-start sm:self-auto" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      {slotsMessage && (
        <p className={`rounded-lg px-4 py-2 text-sm ${dailyFull ? 'bg-amber-50 text-amber-800' : 'bg-clinic-50 text-clinic-700'}`}>
          {slotsMessage}
        </p>
      )}

      {slots.length > 0 && (
        <div className="space-y-3">
          {slots.map((slot) => (
            <article
              key={slot.start_time}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-clinic-heading">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}{' '}
                  <span className="font-normal text-clinic-subtle">({formatDurationShort(totalDurationMinutes)})</span>
                </h3>
                <p className="mt-1 text-sm text-clinic-body">{procedureLabel}</p>
                <p className="text-sm font-medium text-clinic-heading">Total: {formatPrice(totalAmount)}</p>
                <span className="badge mt-2 bg-emerald-100 text-emerald-800">Compatible · Available</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {mode === 'reschedule' ? (
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    disabled={booking}
                    onClick={() => onSelectSlot?.(slot.start_time)}
                  >
                    Use this time
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={booking}
                      onClick={() => onBook('paid', slot.start_time)}
                    >
                      Book Now (Pay)
                    </button>
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      disabled={booking}
                      onClick={() => onBook('pencil', slot.start_time)}
                    >
                      Pencil ({pencilHours}hrs)
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {slots.length === 0 && !slotsMessage && selectedDate && (
        <p className="text-sm text-clinic-subtle">No compatible times on this date. Try another day.</p>
      )}
    </div>
  );
}

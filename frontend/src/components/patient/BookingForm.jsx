import AppointmentCalendar from './AppointmentCalendar';
import ProcedureSelector from './ProcedureSelector';
import PackageSelector from './PackageSelector';
import TimeSlotPicker from './TimeSlotPicker';

export default function BookingForm({
  procedures,
  packages = [],
  selectedProcedures,
  onToggleProcedure,
  selectedPackageId,
  onSelectPackage,
  selectedDate,
  onSelectDate,
  slots,
  slotsMessage,
  dailyFull,
  slotsLoading,
  pencilHours,
  totalAmount,
  totalDuration,
  autoMatchLabel,
  notes,
  onNotesChange,
  booking,
  onBook,
  onRefreshSlots,
}) {
  const selectedProcedureList = procedures.filter((p) =>
    selectedProcedures.includes(Number(p.id))
  );
  const selectedPackage = packages.find(
    (p) => Number(p.id) === Number(selectedPackageId)
  );

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-sm text-white">
            1
          </span>
          Select Package or Procedures
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Choose one package deal or individual procedures — not both at once.
        </p>
        {packages.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Package deals</h3>
            <PackageSelector
              packages={packages}
              selectedPackageId={selectedPackageId}
              onSelectPackage={onSelectPackage}
            />
          </div>
        )}
        <div className={selectedPackageId ? 'pointer-events-none opacity-50' : ''}>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Individual procedures</h3>
          <ProcedureSelector
            procedures={procedures}
            selected={selectedProcedures}
            onToggle={onToggleProcedure}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-sm text-white">
            2
          </span>
          Available Times
        </h2>
        {totalDuration > 0 && (
          <div className="mb-4 rounded-lg bg-sky-50 px-4 py-2 text-sm text-sky-800">
            Your appointment needs {autoMatchLabel || `${totalDuration} min`}
            {selectedDate && ` · Showing slots for ${selectedDate.toLocaleDateString()}`}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Change date (optional)</p>
            <AppointmentCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
          </div>
          <div className="space-y-4">
            <label className="label">
              Notes / symptoms (optional)
              <textarea
                className="input"
                placeholder="Describe your symptoms or concerns..."
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={2}
              />
            </label>
            <TimeSlotPicker
              totalDurationMinutes={totalDuration}
              selectedDate={selectedDate}
              selectedProcedures={
                selectedPackage
                  ? selectedPackage.procedures || []
                  : selectedProcedureList
              }
              slots={slots}
              slotsMessage={slotsMessage}
              dailyFull={dailyFull}
              loading={slotsLoading}
              pencilHours={pencilHours}
              totalAmount={totalAmount}
              booking={booking}
              onBook={onBook}
              onRefresh={onRefreshSlots}
              autoMatchLabel={autoMatchLabel}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

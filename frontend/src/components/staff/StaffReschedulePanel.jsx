import { useState } from 'react';
import AppointmentCalendar from '../patient/AppointmentCalendar';
import TimeSlotPicker from '../patient/TimeSlotPicker';
import ErrorMessage from '../common/ErrorMessage';
import { useRescheduleStaffAppointment, useStaffSlots } from '../../hooks/useStaffAppointments';
import { formatDuration, parseApiError } from '../../utils/formatters';
import { toApiDate } from '../../utils/clinicDates';

export default function StaffReschedulePanel({ appointment, onSuccess, onCancel }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState('');
  const dateStr = selectedDate ? toApiDate(selectedDate) : null;
  const slots = useStaffSlots(
    dateStr,
    appointment.total_duration_minutes,
    Boolean(selectedDate)
  );
  const rescheduleMutation = useRescheduleStaffAppointment();

  const handleReschedule = async (startTime) => {
    if (!selectedDate || !startTime) {
      setError('Select a new date and time slot.');
      return;
    }
    setError('');
    try {
      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        data: { appointment_date: toApiDate(selectedDate), start_time: startTime },
      });
      onSuccess?.();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-clinic-100 bg-clinic-50/80 p-4 sm:p-5">
      <h3 className="text-section-title">Reschedule appointment</h3>
      <p className="text-body text-clinic-subtle">
        Duration stays {formatDuration(appointment.total_duration_minutes)}. Pick a new date and
        time.
      </p>
      <ErrorMessage message={error} />
      <AppointmentCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <TimeSlotPicker
        totalDurationMinutes={appointment.total_duration_minutes}
        selectedDate={selectedDate}
        selectedProcedures={appointment.procedures || []}
        slots={slots.data?.slots || []}
        slotsMessage={slots.data?.message || ''}
        dailyFull={Boolean(slots.data?.daily_full)}
        loading={slots.isLoading}
        pencilHours={4}
        totalAmount={appointment.total_amount}
        booking={rescheduleMutation.isPending}
        mode="reschedule"
        onSelectSlot={handleReschedule}
        onRefresh={() => slots.refetch()}
      />
      <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>
        Cancel reschedule
      </button>
    </div>
  );
}

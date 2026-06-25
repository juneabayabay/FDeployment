import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import QueryState from '../../components/common/QueryState';
import BookingForm from '../../components/patient/BookingForm';
import ClinicPolicyBanner from '../../components/patient/ClinicPolicyBanner';
import { FormSkeleton } from '../../components/patient/PatientSkeletons';
import {
  useClinicInfo,
  useProcedures,
  useCompatibleSlots,
  useCreateAppointment,
} from '../../hooks/useAppointments';
import { parseApiDate, toApiDate } from '../../utils/clinicDates';
import { parseApiError } from '../../utils/formatters';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date');

  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? parseApiDate(initialDate) : null
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const clinic = useClinicInfo();
  const procedures = useProcedures();
  const createMutation = useCreateAppointment();

  const procList = procedures.data || [];
  const totalDuration = procList
    .filter((p) => selectedProcedures.includes(Number(p.id)))
    .reduce((sum, p) => sum + p.duration_minutes, 0);
  const totalAmount = procList
    .filter((p) => selectedProcedures.includes(Number(p.id)))
    .reduce((sum, p) => sum + Number(p.price), 0);

  const dateParam = selectedDate ? toApiDate(selectedDate) : null;
  const slots = useCompatibleSlots(selectedProcedures, dateParam);
  const displayDate = selectedDate || (slots.data?.date ? parseApiDate(slots.data.date) : null);

  const toggleProcedure = (id) => {
    const numId = Number(id);
    setSelectedProcedures((prev) =>
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
    );
    setSelectedDate(null);
  };

  const handleBook = async (bookingType, startTime) => {
    setError('');
    if (!displayDate || !startTime || selectedProcedures.length === 0) {
      setError('Please select a procedure, date, and time.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        appointment_date: toApiDate(displayDate),
        start_time: startTime,
        procedure_ids: selectedProcedures,
        booking_type: bookingType,
        notes,
      });
      navigate('/patient/appointments', {
        replace: true,
        state: {
          message:
            bookingType === 'paid'
              ? 'Appointment confirmed! Check your notifications.'
              : `Pencil booking saved! Complete payment within ${clinic.data?.pencil_booking_hours || 4} hours.`,
        },
      });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const pencilHours = clinic.data?.pencil_booking_hours || 4;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Appointment"
        subtitle="Choose procedures — compatible times appear automatically"
      />

      <QueryState
        isLoading={clinic.isLoading || procedures.isLoading}
        isError={clinic.isError || procedures.isError}
        error={clinic.error || procedures.error}
        skeleton={<FormSkeleton />}
        onRetry={() => {
          clinic.refetch();
          procedures.refetch();
        }}
      >
        <ErrorMessage message={error} />

        <BookingForm
          procedures={procList}
          selectedProcedures={selectedProcedures}
          onToggleProcedure={toggleProcedure}
          selectedDate={displayDate}
          onSelectDate={setSelectedDate}
          slots={slots.data?.slots || []}
          slotsMessage={slots.data?.message || ''}
          dailyFull={Boolean(slots.data?.daily_full)}
          slotsLoading={slots.isLoading}
          pencilHours={pencilHours}
          totalAmount={totalAmount}
          totalDuration={totalDuration}
          autoMatchLabel={slots.data?.duration_label || ''}
          notes={notes}
          onNotesChange={setNotes}
          booking={createMutation.isPending}
          onBook={handleBook}
          onRefreshSlots={() => slots.refetch()}
        />

        {slots.data?.daily_full && (
          <p className="text-sm text-amber-700">
            This day is full.{' '}
            <button
              type="button"
              className="font-medium text-sky-600 underline"
              onClick={() => navigate('/patient/waiting-list')}
            >
              Join the waiting list
            </button>
          </p>
        )}

        <ClinicPolicyBanner clinicInfo={clinic.data} />
      </QueryState>
    </div>
  );
}

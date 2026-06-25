import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '../../hooks/useAppointments';
import { useCreateStaffAppointment } from '../../hooks/useStaffAppointments';
import { usePatientList } from '../../hooks/usePatients';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { parseApiDate, toApiDate } from '../../utils/clinicDates';
import { parseApiError } from '../../utils/formatters';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { path } = useStaffPaths();
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const clinic = useClinicInfo();
  const procedures = useProcedures();
  const patients = usePatientList({ search: patientSearch || undefined });
  const createMutation = useCreateStaffAppointment();

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
    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (!displayDate || !startTime || selectedProcedures.length === 0) {
      setError('Please select procedures, date, and time.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        patient_id: Number(patientId),
        appointment_date: toApiDate(displayDate),
        start_time: startTime,
        procedure_ids: selectedProcedures,
        booking_type: bookingType,
        notes,
      });
      navigate(path('/appointments'), {
        replace: true,
        state: { message: 'Appointment booked successfully.' },
      });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const patientOptions = patients.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Appointment"
        subtitle="Schedule an appointment on behalf of a patient"
      />

      <ErrorMessage message={error} />

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Select patient</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">
            Search patients
            <input
              type="search"
              className="input"
              placeholder="Name, email, or phone..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
          </label>
          <label className="label">
            Patient
            <select
              className="input"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="">Choose a patient...</option>
              {patientOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.email}
                  {p.phone ? ` · ${p.phone}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

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
        <ClinicPolicyBanner clinic={clinic.data} />
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
          pencilHours={clinic.data?.pencil_booking_hours || 4}
          totalAmount={totalAmount}
          totalDuration={totalDuration}
          autoMatchLabel={slots.data?.auto_match_label}
          notes={notes}
          onNotesChange={setNotes}
          booking={createMutation.isPending}
          onBook={handleBook}
          onRefreshSlots={() => slots.refetch()}
        />
      </QueryState>
    </div>
  );
}

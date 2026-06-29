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
import { staffAppointmentsService } from '../../services';
import { useDentistDirectory } from '../../hooks/useDentists';
import DentistDirectoryPanel from '../../components/dentists/DentistDirectoryPanel';
import AppointmentParticipants from '../../components/appointments/AppointmentParticipants';
import { usePatientList } from '../../hooks/usePatients';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { parseApiDate, toApiDate } from '../../utils/clinicDates';
import { parseApiError, formatTime } from '../../utils/formatters';
import { getBookingSourceLabel } from '../../utils/appointmentStatus';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { path } = useStaffPaths();
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [preferredDentist, setPreferredDentist] = useState(null);
  const [bookingSource, setBookingSource] = useState('online');
  const [quickBookOffer, setQuickBookOffer] = useState(null);
  const [quickBookLoading, setQuickBookLoading] = useState(false);
  const [error, setError] = useState('');

  const clinic = useClinicInfo();
  const procedures = useProcedures();
  const dentists = useDentistDirectory();
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
    setQuickBookOffer(null);
    setBookingSource('online');
  };

  const handleQuickBook = async (source) => {
    setError('');
    setQuickBookOffer(null);
    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (selectedProcedures.length === 0 || totalDuration < 1) {
      setError('Please select at least one procedure.');
      return;
    }
    setQuickBookLoading(true);
    setBookingSource(source);
    const today = toApiDate(new Date());
    try {
      const { data } = await staffAppointmentsService.getNextAvailableSlot({
        date: today,
        duration_minutes: totalDuration,
      });
      if (!data.start_time) {
        setError(data.message || 'No available slots today.');
        return;
      }
      setSelectedDate(parseApiDate(today));
      setQuickBookOffer({
        source,
        startTime: data.start_time,
        date: today,
      });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setQuickBookLoading(false);
    }
  };

  const handleBook = async (bookingType, startTime, sourceOverride) => {
    setError('');
    const source = sourceOverride || bookingSource;
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
        booking_source: source,
        dentist_id: preferredDentist?.user_id ?? null,
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
  const selectedPatient = patientOptions.find((p) => String(p.id) === String(patientId));

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
        <DentistDirectoryPanel
          dentists={dentists.data?.results ?? []}
          loading={dentists.isLoading}
          error={dentists.error}
          onRetry={() => dentists.refetch()}
          selectable
          selectedDentistId={preferredDentist?.id}
          onSelectDentist={(dentist) =>
            setPreferredDentist((current) =>
              current?.id === dentist.id ? null : dentist
            )
          }
          title="Assign dentist (optional)"
          subtitle="Select the dentist for this appointment."
        />

        {(selectedPatient || preferredDentist) && (
          <div className="card">
            <p className="mb-3 text-sm font-medium text-slate-700">Booking preview</p>
            <AppointmentParticipants
              patient={selectedPatient}
              dentist={
                preferredDentist
                  ? {
                      ...preferredDentist,
                      full_name: preferredDentist.display_name,
                      role_slugs: ['dentist'],
                    }
                  : null
              }
            />
          </div>
        )}

        <ClinicPolicyBanner clinic={clinic.data} />

        <section className="card flex flex-wrap gap-3">
          <p className="w-full text-sm font-medium text-slate-700">Quick booking for today</p>
          <button
            type="button"
            className="btn-outline btn-sm"
            disabled={quickBookLoading || createMutation.isPending}
            onClick={() => handleQuickBook('walk_in')}
          >
            {quickBookLoading && bookingSource === 'walk_in' ? 'Finding slot…' : 'Walk-in'}
          </button>
          <button
            type="button"
            className="btn-danger btn-sm"
            disabled={quickBookLoading || createMutation.isPending}
            onClick={() => handleQuickBook('emergency')}
          >
            {quickBookLoading && bookingSource === 'emergency' ? 'Finding slot…' : 'Emergency'}
          </button>
        </section>

        {quickBookOffer && (
          <div className="card border-violet-200 bg-violet-50">
            <p className="text-sm text-violet-900">
              Next available slot today: <strong>{formatTime(quickBookOffer.startTime)}</strong>
              {' · '}
              {getBookingSourceLabel(quickBookOffer.source)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary btn-sm"
                disabled={createMutation.isPending}
                onClick={() => handleBook('pencil', quickBookOffer.startTime, quickBookOffer.source)}
              >
                Confirm pencil booking
              </button>
              <button
                type="button"
                className="btn-outline btn-sm"
                disabled={createMutation.isPending}
                onClick={() => handleBook('paid', quickBookOffer.startTime, quickBookOffer.source)}
              >
                Book & pay now
              </button>
            </div>
          </div>
        )}

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

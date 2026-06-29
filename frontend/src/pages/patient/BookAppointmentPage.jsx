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
  useProcedurePackages,
  useCompatibleSlots,
  useCreateAppointment,
} from '../../hooks/useAppointments';
import { useDentistDirectory } from '../../hooks/useDentists';
import DentistDirectoryPanel from '../../components/dentists/DentistDirectoryPanel';
import AppointmentParticipants from '../../components/appointments/AppointmentParticipants';
import { useAuth } from '../../hooks/useAuth';
import { parseApiDate, toApiDate } from '../../utils/clinicDates';
import { parseApiError } from '../../utils/formatters';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date');

  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? parseApiDate(initialDate) : null
  );
  const [notes, setNotes] = useState('');
  const [preferredDentist, setPreferredDentist] = useState(null);
  const [error, setError] = useState('');

  const clinic = useClinicInfo();
  const procedures = useProcedures();
  const packages = useProcedurePackages();
  const dentists = useDentistDirectory();
  const createMutation = useCreateAppointment();

  const procList = procedures.data || [];
  const packageList = packages.data || [];
  const selectedPackage = packageList.find(
    (p) => Number(p.id) === Number(selectedPackageId)
  );

  const totalDuration = selectedPackage
    ? selectedPackage.total_duration_minutes
    : procList
        .filter((p) => selectedProcedures.includes(Number(p.id)))
        .reduce((sum, p) => sum + p.duration_minutes, 0);
  const totalAmount = selectedPackage
    ? Number(selectedPackage.package_price)
    : procList
        .filter((p) => selectedProcedures.includes(Number(p.id)))
        .reduce((sum, p) => sum + Number(p.price), 0);

  const dateParam = selectedDate ? toApiDate(selectedDate) : null;
  const slots = useCompatibleSlots(selectedProcedures, dateParam, selectedPackageId);
  const displayDate = selectedDate || (slots.data?.date ? parseApiDate(slots.data.date) : null);

  const toggleProcedure = (id) => {
    const numId = Number(id);
    setSelectedPackageId(null);
    setSelectedProcedures((prev) =>
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
    );
    setSelectedDate(null);
  };

  const handleSelectPackage = (packageId) => {
    setSelectedPackageId(packageId);
    if (packageId) setSelectedProcedures([]);
    setSelectedDate(null);
  };

  const handleBook = async (bookingType, startTime) => {
    setError('');
    if (!displayDate || !startTime || (!selectedPackageId && selectedProcedures.length === 0)) {
      setError('Please select a package or procedure, date, and time.');
      return;
    }
    try {
      const payload = {
        appointment_date: toApiDate(displayDate),
        start_time: startTime,
        booking_type: bookingType,
        dentist_id: preferredDentist?.user_id ?? null,
        notes,
      };
      if (selectedPackageId) {
        payload.package_id = Number(selectedPackageId);
      } else {
        payload.procedure_ids = selectedProcedures;
      }
      await createMutation.mutateAsync(payload);
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
        isLoading={clinic.isLoading || procedures.isLoading || packages.isLoading}
        isError={clinic.isError || procedures.isError || packages.isError}
        error={clinic.error || procedures.error || packages.error}
        skeleton={<FormSkeleton />}
        onRetry={() => {
          clinic.refetch();
          procedures.refetch();
          packages.refetch();
        }}
      >
        <ErrorMessage message={error} />

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
          title="Choose a dentist (optional)"
          subtitle="Your selection is saved with the appointment."
        />

        {preferredDentist && (
          <div className="card flex items-center gap-4">
            <p className="text-sm font-medium text-slate-700">Booking preview</p>
            <AppointmentParticipants
              patient={user}
              dentist={{
                ...preferredDentist,
                full_name: preferredDentist.display_name,
                role_slugs: ['dentist'],
              }}
            />
          </div>
        )}

        <BookingForm
          procedures={procList}
          packages={packageList}
          selectedProcedures={selectedProcedures}
          onToggleProcedure={toggleProcedure}
          selectedPackageId={selectedPackageId}
          onSelectPackage={handleSelectPackage}
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

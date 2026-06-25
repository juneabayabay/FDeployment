import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import AppointmentMonthView from '../../components/patient/AppointmentMonthView';
import { CalendarSkeleton } from '../../components/patient/PatientSkeletons';
import { useAppointments } from '../../hooks/useAppointments';
import { toApiDate } from '../../utils/clinicDates';

export default function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const active = useAppointments('active');
  const history = useAppointments('history');

  const allAppts = [...(active.data || []), ...(history.data || [])];
  const isLoading = active.isLoading || history.isLoading;
  const isError = active.isError || history.isError;
  const error = active.error || history.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Calendar"
        subtitle="View your scheduled visits — tap a day to book"
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={false}
        skeleton={<CalendarSkeleton />}
        onRetry={() => {
          active.refetch();
          history.refetch();
        }}
      >
        <AppointmentMonthView
          appointments={allAppts}
          onDateClick={(date) => navigate(`/patient/book?date=${toApiDate(date)}`)}
        />
      </QueryState>
    </div>
  );
}

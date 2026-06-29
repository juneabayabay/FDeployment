import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppointmentCalendar from '../../components/patient/AppointmentCalendar';
import AppointmentCard, { AppointmentHistoryItem } from '../../components/patient/AppointmentCard';
import TimeSlotPicker from '../../components/patient/TimeSlotPicker';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CardListSkeleton } from '../../components/patient/PatientSkeletons';
import {
  useAppointments,
  useClinicInfo,
  useCancelAppointment,
  useRescheduleAppointment,
  useSlots,
} from '../../hooks/useAppointments';
import { parseApiError, formatDuration, formatPrice } from '../../utils/formatters';
import { toApiDate } from '../../utils/clinicDates';

function buildCancelSuccessMessage(cancellationFee) {
  const fee = Number(cancellationFee || 0);
  let message =
    'Your appointment has been cancelled successfully. It has been removed from your active schedule, and the clinic staff have been notified.';
  if (fee > 0) {
    message += ` A cancellation fee of ${formatPrice(fee)} has been added to your billing per clinic policy.`;
  }
  return message;
}

export default function PatientAppointmentsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const active = useAppointments('active');
  const history = useAppointments('history');
  const clinic = useClinicInfo();

  const rescheduleAppt = (active.data || []).find((a) => a.id === rescheduleId);
  const duration = rescheduleAppt?.total_duration_minutes || 0;
  const dateStr = selectedDate ? toApiDate(selectedDate) : null;

  const slots = useSlots(dateStr, duration, Boolean(rescheduleId && selectedDate));
  const cancelMutation = useCancelAppointment();
  const rescheduleMutation = useRescheduleAppointment();

  const cancelHours = clinic.data?.cancellation_window_hours || 24;
  const noShowFee = clinic.data?.no_show_fee || '300';
  const pencilHours = clinic.data?.pencil_booking_hours || 4;

  const handleCancel = async (id) => {
    const warnFee = `Are you sure you want to cancel this appointment? If you cancel within ${cancelHours} hours of your visit, a fee of ₱${noShowFee} may apply.`;
    if (!window.confirm(warnFee)) return;

    setError('');
    setMessage('');
    setCancellingId(id);

    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }

    try {
      const { data } = await cancelMutation.mutateAsync(id);
      setRescheduleId(null);
      setSelectedDate(null);
      setMessage(buildCancelSuccessMessage(data?.cancellation_fee));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = async (startTime) => {
    if (!rescheduleAppt || !selectedDate || !startTime) {
      setError('Select a new date and time slot.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await rescheduleMutation.mutateAsync({
        id: rescheduleAppt.id,
        data: { appointment_date: toApiDate(selectedDate), start_time: startTime },
      });
      setMessage('Your appointment has been rescheduled successfully.');
      setRescheduleId(null);
      setSelectedDate(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const currentData = tab === 'active' ? active : history;
  const isLoading = active.isLoading || history.isLoading;
  const isError = active.isError || history.isError;

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" subtitle="View, reschedule, or cancel your appointments" />

      {message && (
        <AlertBanner message={message} variant="success" onDismiss={() => setMessage('')} />
      )}
      <ErrorMessage message={error} />

      <div className="flex flex-wrap gap-2">
        {['active', 'history'].map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-clinic-500 text-white'
                : 'border border-clinic-100 bg-white text-clinic-body hover:bg-clinic-50'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={currentData.error}
        isEmpty={!(currentData.data || []).length}
        emptyTitle={tab === 'active' ? 'No active appointments' : 'No appointment history'}
        emptyDescription={
          tab === 'active'
            ? 'Book your next visit on the Book page.'
            : 'Cancelled and completed visits will appear here.'
        }
        skeleton={<CardListSkeleton count={2} />}
        onRetry={() => currentData.refetch()}
        emptyAction={
          tab === 'active' ? (
            <Link to="/patient/book" className="btn-primary btn-sm">
              Book appointment
            </Link>
          ) : null
        }
      >
        {tab === 'active' ? (
          <div className="space-y-4">
            {(active.data || []).map((appt) => (
              <div key={appt.id}>
                <AppointmentCard
                  appointment={appt}
                  onCancel={() => handleCancel(appt.id)}
                  onReschedule={() => {
                    setRescheduleId(appt.id);
                    setSelectedDate(null);
                    setError('');
                  }}
                  cancelling={cancellingId === appt.id}
                />
                {rescheduleId === appt.id && (
                  <div className="mt-4 space-y-4 rounded-xl border border-clinic-100 bg-clinic-50/80 p-4 sm:p-5">
                    <h3 className="text-section-title">Reschedule appointment</h3>
                    <p className="text-body text-clinic-subtle">
                      Duration stays {formatDuration(appt.total_duration_minutes)}. Pick a new date
                      and time.
                    </p>
                    <AppointmentCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                    <TimeSlotPicker
                      totalDurationMinutes={appt.total_duration_minutes}
                      selectedDate={selectedDate}
                      selectedProcedures={appt.procedures || []}
                      slots={slots.data?.slots || []}
                      slotsMessage={slots.data?.message || ''}
                      dailyFull={Boolean(slots.data?.daily_full)}
                      loading={slots.isLoading}
                      pencilHours={pencilHours}
                      totalAmount={appt.total_amount}
                      booking={rescheduleMutation.isPending}
                      mode="reschedule"
                      onSelectSlot={handleReschedule}
                      onRefresh={() => slots.refetch()}
                    />
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => setRescheduleId(null)}
                    >
                      Cancel reschedule
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {(history.data || []).map((a) => (
              <AppointmentHistoryItem key={a.id} appointment={a} />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
}

import { Link } from 'react-router-dom';
import QueryState from '../../components/common/QueryState';
import PatientHero from '../../components/patient/PatientHero';
import QuickActionGrid from '../../components/patient/QuickActionGrid';
import StatsCard from '../../components/patient/StatsCard';
import AppointmentCard from '../../components/patient/AppointmentCard';
import ClinicPolicyBanner from '../../components/patient/ClinicPolicyBanner';
import { DashboardSkeleton } from '../../components/patient/PatientSkeletons';
import { useAuth } from '../../hooks/useAuth';
import { useBilling } from '../../hooks/useBilling';
import { useNotifications } from '../../hooks/useNotifications';
import { useAppointments, useClinicInfo } from '../../hooks/useAppointments';
import { formatPrice } from '../../utils/formatters';

const QUICK_ACTIONS = [
  { path: '/patient/book', label: 'Book Visit', icon: 'book' },
  { path: '/patient/calendar', label: 'Calendar', icon: 'calendar' },
  { path: '/patient/waiting-list', label: 'Waiting List', icon: 'clock' },
  { path: '/patient/profile', label: 'Profile', icon: 'user' },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const clinic = useClinicInfo();
  const appointments = useAppointments('active');
  const billing = useBilling();
  const notifications = useNotifications();

  const isLoading = clinic.isLoading || appointments.isLoading || billing.isLoading || notifications.isLoading;
  const isError = clinic.isError || appointments.isError || billing.isError || notifications.isError;
  const error = clinic.error || appointments.error || billing.error || notifications.error;

  const activeAppt = appointments.data?.[0] || null;
  const totalBalance = (billing.data || []).reduce((sum, b) => sum + Number(b.balance), 0);
  const unreadCount = (notifications.data || []).filter((n) => !n.is_read).length;

  const refetchAll = () => {
    clinic.refetch();
    appointments.refetch();
    billing.refetch();
    notifications.refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PatientHero user={user} clinicInfo={null} />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QueryState isError={isError} error={error} onRetry={refetchAll}>
        <PatientHero user={user} clinicInfo={clinic.data} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatsCard
            label="Active appointment"
            value={activeAppt ? '1' : 'None'}
            subtext={activeAppt ? 'Upcoming visit scheduled' : 'Book your next visit'}
            accent={activeAppt ? 'emerald' : 'sky'}
          />
          <StatsCard
            label="Balance due"
            value={formatPrice(totalBalance)}
            subtext={totalBalance > 0 ? 'Outstanding balance' : 'All paid up'}
            accent={totalBalance > 0 ? 'amber' : 'emerald'}
          />
          <StatsCard
            label="Notifications"
            value={unreadCount}
            subtext={unreadCount ? 'Unread alerts' : 'All caught up'}
            accent="sky"
          />
        </div>

        {activeAppt ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Next appointment</h2>
              <Link to="/patient/appointments" className="text-sm text-sky-600 hover:text-sky-800">
                View all →
              </Link>
            </div>
            <AppointmentCard
              appointment={activeAppt}
              showActions={false}
              onCancel={() => {}}
              onReschedule={() => {}}
            />
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-6 text-center">
            <p className="text-slate-600">No upcoming appointments</p>
            <Link to="/patient/book" className="btn-primary mt-3 inline-flex">
              Book your next visit
            </Link>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick actions</h2>
          <QuickActionGrid actions={QUICK_ACTIONS} />
        </section>

        <ClinicPolicyBanner clinicInfo={clinic.data} />
      </QueryState>
    </div>
  );
}

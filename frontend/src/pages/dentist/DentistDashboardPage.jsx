import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import DentistStatsGrid from '../../components/dentist/DentistStatsGrid';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useDashboardStats } from '../../hooks/useReports';
import { useStaffSchedule } from '../../hooks/useStaffAppointments';
import { DENTIST_NAV_ITEMS } from '../../utils/constants';
import { toApiDate } from '../../utils/clinicDates';
import { formatTime, formatDuration } from '../../utils/formatters';

export default function DentistDashboardPage() {
  const { user } = useAuth();
  const { can } = usePermission();
  const { path } = useStaffPaths();
  const today = toApiDate(new Date());

  const statsQuery = useDashboardStats(can('reports.view'));
  const schedule = useStaffSchedule(can('appointments.view') ? today : null);

  const stats = statsQuery.data
    ? {
        isLoading: statsQuery.isLoading,
        todayCount: statsQuery.data.today_appointments,
        activePatients: statsQuery.data.active_patients,
        pendingAppointments: statsQuery.data.pending_appointments,
        pendingDownPayments: statsQuery.data.pending_down_payments,
        newPatientsMonth: statsQuery.data.new_patients_month,
      }
    : { isLoading: statsQuery.isLoading };

  const quickLinks = DENTIST_NAV_ITEMS.filter(
    (item) => item.path !== '/dashboard' && (!item.permission || can(item.permission))
  );

  const todayAppts = schedule.data?.appointments || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dentist Dashboard"
        subtitle={`Welcome, Dr. ${user?.last_name || user?.first_name || user?.email}`}
        actions={
          <button type="button" className="btn-outline btn-sm" onClick={() => statsQuery.refetch()}>
            Refresh
          </button>
        }
      />

      {can('reports.view') && <DentistStatsGrid stats={stats} path={path} />}

      {can('appointments.view') && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-clinic-heading">Today&apos;s schedule</h2>
            <Link to={path('/schedule')} className="text-sm text-clinic-500">
              Full schedule →
            </Link>
          </div>
          <QueryState
            isLoading={schedule.isLoading}
            isError={schedule.isError}
            error={schedule.error}
            isEmpty={todayAppts.length === 0}
            emptyTitle="No appointments today"
            onRetry={() => schedule.refetch()}
          >
            <ul className="divide-y divide-slate-100">
              {todayAppts.slice(0, 5).map((appt) => (
                <li key={appt.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-clinic-heading">
                      {formatTime(appt.start_time)} — {appt.patient?.full_name || appt.patient?.email}
                    </p>
                    <p className="text-clinic-subtle">
                      {(appt.procedures || []).map((p) => p.name).join(', ')} ·{' '}
                      {formatDuration(appt.total_duration_minutes)}
                    </p>
                  </div>
                  {appt.patient?.id && (
                    <Link to={path(`/patients/${appt.patient.id}`)} className="text-clinic-500">
                      Chart
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </QueryState>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.path} to={path(item.path)} className="card transition-shadow hover:shadow-md">
            <h3 className="font-semibold text-clinic-heading">{item.label}</h3>
            <p className="mt-1 text-sm text-clinic-500">Open →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

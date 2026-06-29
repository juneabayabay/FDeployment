import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useStaffSchedule, useStaffWaitingList } from '../../hooks/useStaffAppointments';
import { RECEPTIONIST_NAV_ITEMS } from '../../utils/constants';
import { toApiDate } from '../../utils/clinicDates';
import { unwrapList } from '../../utils/formatters';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { can, hasRole } = usePermission();
  const { path } = useStaffPaths();
  const today = toApiDate(new Date());

  const schedule = useStaffSchedule(can('appointments.view') ? today : null);
  const waitingList = useStaffWaitingList({});
  const waitingEntries = unwrapList(waitingList.data);

  const quickLinks = RECEPTIONIST_NAV_ITEMS.filter((item) => {
    if (item.path === '/dashboard') return false;
    if (item.role && !hasRole(item.role)) return false;
    if (item.permission && !can(item.permission)) return false;
    return true;
  });

  const todayCount = schedule.data?.appointments?.length ?? null;
  const waitingCount = can('appointments.view') ? waitingEntries.length : null;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.first_name || user?.email}`}
        subtitle={`Roles: ${user?.role_slugs?.join(', ') || '—'}`}
      />

      {can('appointments.view') && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <p className="text-sm text-clinic-subtle">Today&apos;s appointments</p>
            <QueryState isLoading={schedule.isLoading} skeleton={<div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-200" />}>
              <p className="mt-1 text-3xl font-bold text-clinic-700">{todayCount}</p>
            </QueryState>
            <Link to={path('/schedule')} className="mt-2 inline-block text-sm text-clinic-500 hover:text-clinic-700">
              View schedule →
            </Link>
          </div>
          <div className="card">
            <p className="text-sm text-clinic-subtle">Waiting list</p>
            <QueryState isLoading={waitingList.isLoading} skeleton={<div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-200" />}>
              <p className="mt-1 text-3xl font-bold text-amber-600">{waitingCount}</p>
            </QueryState>
            <Link to={path('/waiting-list')} className="mt-2 inline-block text-sm text-clinic-500 hover:text-clinic-700">
              Manage waiting list →
            </Link>
          </div>
          {can('appointments.create') && (
            <Link to={path('/appointments/book')} className="card transition-shadow hover:shadow-md">
              <p className="font-semibold text-clinic-heading">Book appointment</p>
              <p className="mt-1 text-sm text-clinic-500">Schedule for a patient →</p>
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.path}
            to={path(item.path)}
            className="card transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold text-clinic-heading">{item.label}</h3>
            <p className="mt-1 text-sm text-clinic-500">Open →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

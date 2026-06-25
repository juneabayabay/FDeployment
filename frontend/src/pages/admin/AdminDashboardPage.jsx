import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import AdminStatsGrid from '../../components/admin/AdminStatsGrid';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useDashboardStats } from '../../hooks/useReports';
import { ADMIN_NAV_ITEMS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { can, hasRole } = usePermission();
  const { path } = useStaffPaths();
  const statsQuery = useDashboardStats(can('reports.view'));

  const stats = statsQuery.data
    ? {
        isLoading: statsQuery.isLoading,
        refetch: () => statsQuery.refetch(),
        todayCount: statsQuery.data.today_appointments,
        pencilCount: statsQuery.data.pencil_booked,
        waitingCount: statsQuery.data.waiting_list_count,
        outstandingBalance: Number(statsQuery.data.outstanding_balance || 0),
        outstandingRecordCount: statsQuery.data.outstanding_records,
        collectedToday: Number(statsQuery.data.revenue_today || 0),
        activePatients: statsQuery.data.active_patients,
        newPatientsMonth: statsQuery.data.new_patients_month,
        pendingAppointments: statsQuery.data.pending_appointments,
      }
    : { isLoading: statsQuery.isLoading, refetch: () => statsQuery.refetch() };

  const quickLinks = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.path === '/dashboard') return false;
    if (item.role && !hasRole(item.role)) return false;
    if (item.permission && !can(item.permission)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome, ${user?.first_name || user?.email} · Live stats refresh every 60s`}
        actions={
          <button type="button" className="btn-outline btn-sm" onClick={() => statsQuery.refetch()}>
            Refresh now
          </button>
        }
      />

      {can('reports.view') && (
        <>
          <AdminStatsGrid stats={stats} path={path} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <p className="text-sm text-slate-500">Revenue today</p>
              <QueryState isLoading={statsQuery.isLoading} skeleton={<div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200" />}>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatPrice(statsQuery.data?.revenue_today || 0)}
                </p>
              </QueryState>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Revenue this month</p>
              <QueryState isLoading={statsQuery.isLoading} skeleton={<div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200" />}>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatPrice(statsQuery.data?.revenue_month || 0)}
                </p>
              </QueryState>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Active patients</p>
              <p className="mt-1 text-2xl font-bold text-sky-700">{statsQuery.data?.active_patients ?? '—'}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">New patients (month)</p>
              <p className="mt-1 text-2xl font-bold text-sky-700">{statsQuery.data?.new_patients_month ?? '—'}</p>
            </div>
          </div>
        </>
      )}

      {(stats.pencilCount > 0 || statsQuery.data?.pending_down_payments > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.pencilCount > 0 && (
            <Link
              to={`${path('/appointments')}?status=pencil_booked`}
              className="card border-orange-200 bg-orange-50 hover:shadow-md"
            >
              <p className="font-semibold text-orange-900">
                {stats.pencilCount} pencil booking{stats.pencilCount !== 1 ? 's' : ''} need review
              </p>
            </Link>
          )}
          {(statsQuery.data?.pending_down_payments || 0) > 0 && (
            <Link to={path('/braces-approvals')} className="card border-purple-200 bg-purple-50 hover:shadow-md">
              <p className="font-semibold text-purple-900">
                {statsQuery.data.pending_down_payments} braces down payment
                {statsQuery.data.pending_down_payments !== 1 ? 's' : ''} pending
              </p>
            </Link>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.path} to={path(item.path)} className="card transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-slate-900">{item.label}</h3>
              <p className="mt-1 text-sm text-sky-600">Open →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

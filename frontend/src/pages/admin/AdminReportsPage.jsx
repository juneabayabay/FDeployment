import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import BarChart from '../../components/reports/BarChart';
import { useReports } from '../../hooks/useReports';
import { formatDate, formatPrice } from '../../utils/formatters';

const PERIODS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
  { value: 'quarterly', label: 'This quarter' },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const report = useReports({ period });
  const data = report.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Clinic performance summaries" />

      <div className="card flex flex-wrap gap-3">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              period === p.value ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <QueryState
        isLoading={report.isLoading}
        isError={report.isError}
        error={report.error}
        onRetry={() => report.refetch()}
      >
        {data && (
          <>
            <p className="text-sm text-slate-500">
              {formatDate(data.from)} — {formatDate(data.to)}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card">
                <p className="text-sm text-slate-500">Appointments</p>
                <p className="text-2xl font-bold text-sky-700">{data.appointments_total}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500">Completed visits</p>
                <p className="text-2xl font-bold text-emerald-700">{data.appointments_completed}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500">Revenue collected</p>
                <p className="text-2xl font-bold text-emerald-700">{formatPrice(data.revenue_collected)}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-500">Cancellation fees</p>
                <p className="text-2xl font-bold text-red-600">{formatPrice(data.cancellation_fees)}</p>
              </div>
            </div>

            {data.daily_breakdown?.length > 0 && (
              <div className="card space-y-4">
                <h2 className="font-semibold text-slate-900">Daily revenue</h2>
                <BarChart data={data.daily_breakdown} valueKey="revenue" formatValue={formatPrice} />
              </div>
            )}

            {data.daily_breakdown?.length > 0 && (
              <div className="card space-y-4">
                <h2 className="font-semibold text-slate-900">Daily appointments</h2>
                <BarChart data={data.daily_breakdown} valueKey="appointments" />
              </div>
            )}

            <div className="card">
              <h2 className="mb-3 font-semibold text-slate-900">Status breakdown</h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {Object.entries(data.appointment_counts || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <dt className="capitalize text-slate-600">{status.replace('_', ' ')}</dt>
                    <dd className="font-semibold text-slate-900">{count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}

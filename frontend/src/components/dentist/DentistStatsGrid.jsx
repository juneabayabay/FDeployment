import { Link } from 'react-router-dom';
import QueryState from '../common/QueryState';

export default function DentistStatsGrid({ stats, path }) {
  const cards = [
    {
      label: "Today's appointments",
      value: stats.todayCount,
      color: 'text-sky-700',
      link: path('/schedule'),
      linkLabel: 'View schedule',
    },
    {
      label: 'Active patients',
      value: stats.activePatients,
      color: 'text-sky-700',
      link: path('/patients'),
      linkLabel: 'Patient records',
    },
    {
      label: 'Pending appointments',
      value: stats.pendingAppointments,
      color: 'text-amber-600',
    },
    {
      label: 'Braces approvals pending',
      value: stats.pendingDownPayments,
      color: 'text-purple-700',
      link: path('/braces-approvals'),
      linkLabel: 'Review',
    },
    {
      label: 'New patients (month)',
      value: stats.newPatientsMonth,
      color: 'text-emerald-700',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="card">
          <p className="text-sm text-slate-500">{card.label}</p>
          <QueryState
            isLoading={stats.isLoading}
            skeleton={<div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />}
          >
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value ?? '—'}</p>
            {card.link && (
              <Link to={card.link} className="mt-2 inline-block text-sm text-sky-600 hover:text-sky-800">
                {card.linkLabel} →
              </Link>
            )}
          </QueryState>
        </div>
      ))}
    </div>
  );
}

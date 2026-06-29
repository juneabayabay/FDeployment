import { Link } from 'react-router-dom';
import QueryState from '../common/QueryState';
import { formatPrice } from '../../utils/formatters';

export default function AdminStatsGrid({ stats, path }) {
  const cards = [
    {
      label: "Today's appointments",
      value: stats.todayCount,
      color: 'text-clinic-700',
      link: path('/schedule'),
      linkLabel: 'View schedule',
    },
    {
      label: 'Pencil bookings',
      value: stats.pencilCount,
      color: 'text-orange-600',
      link: path('/appointments') + '?status=pencil_booked',
      linkLabel: 'Review pending',
    },
    {
      label: 'Waiting list',
      value: stats.waitingCount,
      color: 'text-amber-600',
      link: path('/waiting-list'),
      linkLabel: 'Manage list',
    },
    {
      label: 'Outstanding balance',
      value: formatPrice(stats.outstandingBalance),
      color: 'text-red-600',
      subtitle: `${stats.outstandingRecordCount} unpaid/partial record${stats.outstandingRecordCount !== 1 ? 's' : ''}`,
      link: path('/billing') + '?payment_status=unpaid',
      linkLabel: 'Open billing',
      isFormatted: true,
    },
    {
      label: "Today's scheduled value",
      value: formatPrice(stats.collectedToday),
      color: 'text-emerald-700',
      subtitle: 'Sum of appointment totals (not payments)',
      isFormatted: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="card">
          <p className="text-sm text-clinic-subtle">{card.label}</p>
          <QueryState
            isLoading={stats.isLoading}
            skeleton={<div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />}
          >
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.isFormatted ? card.value : card.value ?? '—'}
            </p>
            {card.subtitle && <p className="mt-0.5 text-xs text-clinic-muted">{card.subtitle}</p>}
            {card.link && (
              <Link to={card.link} className="mt-2 inline-block text-sm text-clinic-500 hover:text-clinic-700">
                {card.linkLabel} →
              </Link>
            )}
          </QueryState>
        </div>
      ))}
    </div>
  );
}

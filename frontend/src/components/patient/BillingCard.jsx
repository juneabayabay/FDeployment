import { formatDate, formatPrice } from '../../utils/formatters';
import { getStatusBadgeClass } from '../../utils/appointmentStatus';

export default function BillingCard({ record }) {
  const date = record.appointment_date
    ? formatDate(record.appointment_date)
    : formatDate(record.created_at?.slice(0, 10));
  const balance = Number(record.balance);
  const hasBalance = balance > 0;

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        hasBalance ? 'border-amber-200' : 'border-clinic-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption">{date}</p>
          <p className="mt-1 text-lg font-semibold text-clinic-heading">
            {formatPrice(record.total_amount)}
          </p>
        </div>
        <span className={`badge ${getStatusBadgeClass(record.payment_status)}`}>
          {record.payment_status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-emerald-50 px-3 py-2">
          <span className="text-caption font-semibold text-emerald-800">Paid</span>
          <p className="mt-0.5 font-bold text-emerald-700">{formatPrice(record.amount_paid)}</p>
        </div>
        <div
          className={`rounded-lg px-3 py-2 ${
            hasBalance ? 'bg-amber-50' : 'bg-emerald-50'
          }`}
        >
          <span
            className={`text-caption font-semibold ${
              hasBalance ? 'text-amber-900' : 'text-emerald-800'
            }`}
          >
            Balance
          </span>
          <p
            className={`mt-0.5 font-bold ${
              hasBalance ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {formatPrice(record.balance)}
          </p>
        </div>
      </div>
    </article>
  );
}

import { formatDate, formatPrice } from '../../utils/formatters';
import { getStatusBadgeClass, getPaymentStatusLabel } from '../../utils/appointmentStatus';

export default function PatientDetailBillingCard({ record }) {
  const date = record.appointment_date
    ? formatDate(record.appointment_date)
    : formatDate(record.created_at?.slice(0, 10));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{record.description || 'Billing record'}</p>
          <p className="mt-0.5 text-sm text-slate-500">{date}</p>
        </div>
        <span className={`badge shrink-0 ${getStatusBadgeClass(record.payment_status)}`}>
          {getPaymentStatusLabel(record.payment_status)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-slate-500">Total</span>
          <p className="font-medium text-slate-900">{formatPrice(record.total_amount)}</p>
        </div>
        <div>
          <span className="text-slate-500">Paid</span>
          <p className="font-medium text-emerald-700">{formatPrice(record.amount_paid)}</p>
        </div>
        <div>
          <span className="text-slate-500">Balance</span>
          <p className="font-medium text-slate-900">{formatPrice(record.balance)}</p>
        </div>
      </div>
    </article>
  );
}

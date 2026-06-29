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
          <p className="font-semibold text-clinic-heading">{record.description || 'Billing record'}</p>
          <p className="mt-0.5 text-sm text-clinic-subtle">{date}</p>
        </div>
        <span className={`badge shrink-0 ${getStatusBadgeClass(record.payment_status)}`}>
          {getPaymentStatusLabel(record.payment_status)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-clinic-subtle">Total</span>
          <p className="font-medium text-clinic-heading">{formatPrice(record.total_amount)}</p>
        </div>
        <div>
          <span className="text-clinic-subtle">Paid</span>
          <p className="font-medium text-emerald-700">{formatPrice(record.amount_paid)}</p>
        </div>
        <div>
          <span className="text-clinic-subtle">Balance</span>
          <p className="font-medium text-clinic-heading">{formatPrice(record.balance)}</p>
        </div>
      </div>
    </article>
  );
}

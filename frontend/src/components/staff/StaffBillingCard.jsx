import { formatDate, formatPrice } from '../../utils/formatters';
import { getPaymentStatusLabel } from '../../utils/appointmentStatus';

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid'];

export default function StaffBillingCard({ record, onPaymentUpdate, updating }) {
  const date = record.appointment_date
    ? formatDate(record.appointment_date)
    : formatDate(record.created_at?.slice(0, 10));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {record.patient?.full_name || record.patient?.email || '—'}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{date}</p>
        </div>
        <p className="shrink-0 text-lg font-bold text-slate-900">{formatPrice(record.total_amount)}</p>
      </div>

      {record.description && (
        <p className="mt-2 text-sm text-slate-600">{record.description}</p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500">Method</span>
          <p className="font-medium text-slate-800">
            {record.payment_method ? record.payment_method.toUpperCase() : '—'}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Balance</span>
          <p className="font-medium text-slate-900">{formatPrice(record.balance)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="label">
          Amount paid
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            defaultValue={record.amount_paid}
            disabled={updating}
            onBlur={(e) => {
              const val = e.target.value;
              if (val !== String(record.amount_paid)) {
                onPaymentUpdate(record.id, 'amount_paid', val);
              }
            }}
          />
        </label>
        <label className="label">
          Payment status
          <select
            className="input"
            value={record.payment_status}
            disabled={updating}
            onChange={(e) => onPaymentUpdate(record.id, 'payment_status', e.target.value)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {getPaymentStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}

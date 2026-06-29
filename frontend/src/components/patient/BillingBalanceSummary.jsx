import { formatPrice } from '../../utils/formatters';

export default function BillingBalanceSummary({ totalBalance }) {
  const hasDue = totalBalance > 0;

  return (
    <section
      className={`rounded-xl border-2 p-5 shadow-sm sm:p-6 ${
        hasDue
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
          : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-clinic-50'
      }`}
      aria-live="polite"
    >
      <p
        className={`text-xs font-bold uppercase tracking-wider ${
          hasDue ? 'text-amber-900' : 'text-emerald-900'
        }`}
      >
        Total balance
      </p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
          hasDue ? 'text-amber-700' : 'text-emerald-700'
        }`}
      >
        {formatPrice(totalBalance)}
      </p>
      <p
        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
          hasDue
            ? 'bg-amber-200 text-amber-950'
            : 'bg-emerald-200 text-emerald-950'
        }`}
      >
        {hasDue ? 'Outstanding amount due' : 'All payments up to date'}
      </p>
      {hasDue && (
        <p className="text-body mt-3 text-amber-900/90">
          Please settle your balance at the clinic reception or contact us if you have questions.
        </p>
      )}
    </section>
  );
}

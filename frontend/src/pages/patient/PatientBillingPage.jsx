import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import BillingCard from '../../components/patient/BillingCard';
import { CardListSkeleton, TableSkeleton } from '../../components/patient/PatientSkeletons';
import { useBilling } from '../../hooks/useBilling';
import { formatDate, formatPrice } from '../../utils/formatters';
import { getStatusBadgeClass } from '../../utils/appointmentStatus';

export default function PatientBillingPage() {
  const billing = useBilling();
  const records = billing.data || [];
  const totalBalance = records.reduce((sum, b) => sum + Number(b.balance), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="My Billing" subtitle="View your payment records and balances" />

      <div className="patient-hero">
        <p className="text-sm text-sky-100">Total balance</p>
        <p className="text-3xl font-bold">{formatPrice(totalBalance)}</p>
        <p className="mt-1 text-sm text-sky-100">
          {totalBalance > 0 ? 'Outstanding amount due' : 'All payments up to date'}
        </p>
      </div>

      <QueryState
        isLoading={billing.isLoading}
        isError={billing.isError}
        error={billing.error}
        isEmpty={records.length === 0}
        emptyTitle="No billing records"
        emptyDescription="Billing records are created when you book appointments."
        skeleton={
          <>
            <div className="md:hidden">
              <CardListSkeleton count={3} />
            </div>
            <TableSkeleton />
          </>
        }
        onRetry={() => billing.refetch()}
      >
        <div className="space-y-3 md:hidden">
          {records.map((b) => (
            <BillingCard key={b.id} record={b} />
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Date', 'Amount', 'Paid', 'Balance', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {b.appointment_date ? formatDate(b.appointment_date) : formatDate(b.created_at?.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3">{formatPrice(b.total_amount)}</td>
                  <td className="px-4 py-3">{formatPrice(b.amount_paid)}</td>
                  <td className="px-4 py-3">{formatPrice(b.balance)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeClass(b.payment_status)}`}>
                      {b.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
    </div>
  );
}

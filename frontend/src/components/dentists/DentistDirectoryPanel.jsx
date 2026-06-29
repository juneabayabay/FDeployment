import QueryState from '../common/QueryState';
import DentistCard from './DentistCard';

const BOOKING_TITLE = 'Your dentist';
const BOOKING_SUBTITLE = 'All appointments at our clinic are with this dentist.';

export default function DentistDirectoryPanel({
  dentists = [],
  loading,
  error,
  onRetry,
  selectedDentistId,
  selectable = false,
  title,
  subtitle,
}) {
  const bookingDentist = selectable && dentists.length > 0 ? dentists[0] : null;
  const displayDentists = bookingDentist ? [bookingDentist] : dentists;

  const resolvedTitle =
    title ?? (selectable ? BOOKING_TITLE : 'Our dentists');
  const resolvedSubtitle =
    subtitle ??
    (selectable
      ? BOOKING_SUBTITLE
      : 'Meet the team who will care for your smile.');

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-clinic-heading">{resolvedTitle}</h2>
        <p className="text-sm text-clinic-subtle">{resolvedSubtitle}</p>
      </div>

      <QueryState
        isLoading={loading}
        isError={Boolean(error)}
        error={error}
        onRetry={onRetry}
        isEmpty={!loading && displayDentists.length === 0}
        emptyTitle="No dentist listed yet"
        emptyDescription="Your clinic dentist will appear here once staff adds their profile."
      >
        <div className={`grid gap-3 ${selectable ? '' : 'sm:grid-cols-2'}`}>
          {displayDentists.map((dentist) => (
            <DentistCard
              key={dentist.id}
              dentist={dentist}
              compact={selectable}
              selected={selectable && selectedDentistId === dentist.id}
            />
          ))}
        </div>
      </QueryState>
    </section>
  );
}

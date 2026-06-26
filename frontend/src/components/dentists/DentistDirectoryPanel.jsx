import QueryState from '../common/QueryState';
import DentistCard from './DentistCard';

export default function DentistDirectoryPanel({
  dentists = [],
  loading,
  error,
  onRetry,
  selectedDentistId,
  onSelectDentist,
  selectable = false,
  title = 'Our dentists',
  subtitle = 'Meet the team who will care for your smile.',
}) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <QueryState
        isLoading={loading}
        isError={Boolean(error)}
        error={error}
        onRetry={onRetry}
        isEmpty={!loading && dentists.length === 0}
        emptyTitle="No dentists listed yet"
      >
        <div className={`grid gap-3 ${selectable ? '' : 'sm:grid-cols-2'}`}>
          {dentists.map((dentist) => (
            <DentistCard
              key={dentist.id}
              dentist={dentist}
              compact={selectable}
              selected={selectable && selectedDentistId === dentist.id}
              onSelect={selectable ? onSelectDentist : undefined}
            />
          ))}
        </div>
      </QueryState>
    </section>
  );
}

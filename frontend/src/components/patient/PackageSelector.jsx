import { formatDuration, formatPrice } from '../../utils/formatters';

export default function PackageSelector({ packages, selectedPackageId, onSelectPackage }) {
  const selected = packages.find((p) => Number(p.id) === Number(selectedPackageId));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {packages.map((pkg) => {
          const isSelected = Number(selectedPackageId) === Number(pkg.id);
          return (
            <button
              key={pkg.id}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 text-violet-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
              }`}
              onClick={() => onSelectPackage(isSelected ? null : pkg.id)}
            >
              {isSelected ? '✓' : '+'} {pkg.name}{' '}
              <span className="text-slate-500">
                ({formatDuration(pkg.total_duration_minutes)} · {formatPrice(pkg.package_price)})
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        {!selected ? (
          <p className="text-sm text-slate-500">No package selected.</p>
        ) : (
          <>
            {selected.description && (
              <p className="mb-2 text-sm text-slate-600">{selected.description}</p>
            )}
            <ul className="space-y-1 text-sm text-slate-700">
              {(selected.procedures || []).map((p) => (
                <li key={p.id}>
                  {p.name} — {formatDuration(p.duration_minutes)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              Package duration: <strong>{formatDuration(selected.total_duration_minutes)}</strong>
              {' · '}
              Package price: <strong>{formatPrice(selected.package_price)}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

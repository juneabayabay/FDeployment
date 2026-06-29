import { formatDuration, formatPrice } from '../../utils/formatters';

export default function PackageCard({ package: pkg, canManage, onEdit, onDeactivate }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-slate-900">{pkg.name}</p>
      <p className="mt-1 text-sm text-slate-500">
        {formatDuration(pkg.total_duration_minutes)} · {formatPrice(pkg.package_price)}
      </p>
      {pkg.description && <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>}
      <p className="mt-2 text-xs text-slate-500">
        Includes: {(pkg.procedures || []).map((p) => p.name).join(', ') || '—'}
      </p>
      {canManage && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-outline btn-sm" onClick={() => onEdit(pkg)}>
            Edit
          </button>
          {pkg.is_active && (
            <button type="button" className="btn-danger btn-sm" onClick={() => onDeactivate(pkg)}>
              Deactivate
            </button>
          )}
        </div>
      )}
    </article>
  );
}

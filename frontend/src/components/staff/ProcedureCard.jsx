import { formatPrice } from '../../utils/formatters';

const CATEGORY_LABELS = {
  minor: 'Minor',
  orthodontic: 'Orthodontic',
  major: 'Major',
};

export default function ProcedureCard({ procedure, canManage, onEdit, onDeactivate }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-clinic-heading">{procedure.name}</p>
          <p className="mt-0.5 text-sm capitalize text-clinic-subtle">
            {CATEGORY_LABELS[procedure.category] || procedure.category}
          </p>
        </div>
        <span
          className={`badge shrink-0 ${
            procedure.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-clinic-body'
          }`}
        >
          {procedure.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-clinic-subtle">Duration</span>
          <p className="font-medium text-clinic-heading">{procedure.duration_minutes} min</p>
        </div>
        <div>
          <span className="text-clinic-subtle">Price</span>
          <p className="font-medium text-clinic-heading">{formatPrice(procedure.price)}</p>
        </div>
      </div>
      {canManage && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-outline btn-sm" onClick={() => onEdit(procedure)}>
            Edit
          </button>
          {procedure.is_active && (
            <button type="button" className="btn-danger btn-sm" onClick={() => onDeactivate(procedure)}>
              Deactivate
            </button>
          )}
        </div>
      )}
    </article>
  );
}

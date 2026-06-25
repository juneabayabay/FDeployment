import { formatDuration, formatPrice } from '../../utils/formatters';

const CATEGORY_LABELS = {
  minor: 'Minor',
  orthodontic: 'Orthodontic',
  major: 'Major',
};

export default function ProcedureSelector({ procedures, selected, onToggle }) {
  const selectedList = procedures.filter((p) => selected.includes(Number(p.id)));
  const totalDuration = selectedList.reduce((sum, p) => sum + p.duration_minutes, 0);
  const totalPrice = selectedList.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {procedures.map((proc) => {
          const isSelected = selected.includes(Number(proc.id));
          return (
            <button
              key={proc.id}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
              }`}
              onClick={() => onToggle(proc.id)}
            >
              {isSelected ? '✓' : '+'} {proc.name}{' '}
              <span className="text-slate-500">
                ({CATEGORY_LABELS[proc.category] || proc.category} ·{' '}
                {formatDuration(proc.duration_minutes)} · {formatPrice(proc.price)})
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        {selectedList.length === 0 ? (
          <p className="text-sm text-slate-500">No procedures selected yet.</p>
        ) : (
          <>
            <ul className="space-y-1 text-sm text-slate-700">
              {selectedList.map((p) => (
                <li key={p.id}>
                  {p.name} — {formatDuration(p.duration_minutes)} / {formatPrice(p.price)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              Total duration: <strong>{formatDuration(totalDuration)}</strong> · Total cost:{' '}
              <strong>{formatPrice(totalPrice)}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

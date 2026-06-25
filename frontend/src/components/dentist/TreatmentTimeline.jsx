import { formatDate } from '../../utils/formatters';

export default function TreatmentTimeline({ treatments = [], orthodontic = [], surgical = [] }) {
  const items = [
    ...treatments.map((r) => ({
      id: `t-${r.id}`,
      date: r.treatment_date,
      type: 'Treatment',
      title: r.title,
      detail: r.notes,
    })),
    ...orthodontic.map((r) => ({
      id: `o-${r.id}`,
      date: r.updated_at?.slice(0, 10) || r.created_at?.slice(0, 10),
      type: 'Orthodontic',
      title: r.phase || 'Progress update',
      detail: r.progress_notes,
    })),
    ...surgical.map((r) => ({
      id: `s-${r.id}`,
      date: r.surgery_date,
      type: 'Surgical',
      title: r.procedure_name,
      detail: r.notes,
    })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (!items.length) {
    return <p className="py-6 text-center text-sm text-slate-500">No clinical records yet.</p>;
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-sky-200 pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white" />
          <p className="text-xs font-medium uppercase text-sky-600">{item.type}</p>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className="text-sm text-slate-500">{formatDate(item.date)}</p>
          {item.detail && <p className="mt-1 text-sm text-slate-600">{item.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

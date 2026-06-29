export default function StatsCard({ label, value, subtext, accent = 'sky', highlight = false }) {
  const valueColors = {
    sky: 'text-clinic-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
  };

  const cardHighlight = {
    sky: 'border-clinic-100',
    emerald: 'border-emerald-200 bg-emerald-50/40',
    amber: 'border-amber-300 bg-amber-50/80',
  };

  const subtextColors = {
    sky: 'text-clinic-subtle',
    emerald: 'text-emerald-800 font-medium',
    amber: 'text-amber-900 font-semibold',
  };

  return (
    <div
      className={`stat-card border-2 ${highlight ? cardHighlight[accent] || cardHighlight.sky : 'border-clinic-100'}`}
    >
      <p className="text-label text-xs uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColors[accent] || valueColors.sky}`}>{value}</p>
      {subtext && (
        <p className={`mt-1.5 text-xs ${subtextColors[accent] || subtextColors.sky}`}>{subtext}</p>
      )}
    </div>
  );
}

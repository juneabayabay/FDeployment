import { formatDate, formatPrice } from '../../utils/formatters';

function defaultFormatValue(value, valueKey) {
  if (valueKey === 'revenue') return formatPrice(value);
  return String(value);
}

export default function BarChart({
  data,
  valueKey,
  labelKey = 'date',
  formatValue,
}) {
  if (!data?.length) return null;

  const max = Math.max(...data.map((d) => Number(d[valueKey] || 0)), 1);
  const format = formatValue || ((value) => defaultFormatValue(value, valueKey));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <div
          className="flex h-44 items-end gap-1.5 pb-1"
          style={{ minWidth: `max(100%, ${data.length * 2.25}rem)` }}
        >
          {data.map((row) => {
            const val = Number(row[valueKey] || 0);
            const height = `${Math.max(4, (val / max) * 100)}%`;
            const label = row[labelKey];
            const shortLabel = label?.slice(5) || '';
            const tooltip = `${label}: ${format(val)}`;

            return (
              <div
                key={label}
                className="flex h-40 min-w-9 flex-1 flex-col items-center justify-end gap-1"
                title={tooltip}
              >
                <div
                  className="w-full rounded-t bg-sky-500 transition-all"
                  style={{ height }}
                  aria-label={tooltip}
                />
                <span className="hidden w-full truncate text-center text-[10px] text-slate-400 md:block">
                  {shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="space-y-1.5 md:hidden">
        {data.map((row) => {
          const val = Number(row[valueKey] || 0);
          const label = row[labelKey];
          return (
            <li
              key={label}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"
            >
              <span className="text-slate-600">{formatDate(label)}</span>
              <span className="shrink-0 font-semibold text-slate-900">{format(val)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

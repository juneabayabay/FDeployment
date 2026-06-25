import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns,
  rows,
  keyField = 'id',
  loading,
  emptyMessage = 'No records found.',
  renderMobileCard,
}) {
  if (loading) return <LoadingSpinner />;

  if (!rows?.length) {
    return <p className="py-8 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  const table = (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!renderMobileCard) {
    return table;
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <div key={row[keyField]}>{renderMobileCard(row)}</div>
        ))}
      </div>
      <div className="hidden lg:block">{table}</div>
    </>
  );
}

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
    return <p className="text-body py-8 text-center text-clinic-subtle">{emptyMessage}</p>;
  }

  const table = (
    <div className="overflow-x-auto rounded-xl border border-clinic-100 bg-white">
      <table className="min-w-full divide-y divide-clinic-100 text-sm">
        <thead className="bg-clinic-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-label px-4 py-3 text-left text-xs uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-clinic-50">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-clinic-50/60">
              {columns.map((col) => (
                <td key={col.key} className="text-body px-4 py-3">
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
      <div className="hidden md:block">{table}</div>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row[keyField]}>{renderMobileCard(row)}</div>
        ))}
      </div>
    </>
  );
}

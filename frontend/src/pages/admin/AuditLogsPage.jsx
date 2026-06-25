import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import Pagination from '../../components/common/Pagination';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useListPage, useResetPageOnChange, usePaginatedData } from '../../hooks/usePaginatedList';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogsPage() {
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');

  const { page, setPage } = useListPage();
  useResetPageOnChange(page, setPage, module, search);

  const params = {
    page,
    ...(module ? { module } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  };
  const logs = useAuditLogs(params);
  const { results: logRows, totalPages } = usePaginatedData(logs.data);

  const columns = [
    {
      key: 'when',
      label: 'When',
      render: (r) => formatDateTime(r.created_at),
    },
    {
      key: 'actor',
      label: 'User',
      render: (r) => r.actor?.full_name || r.actor?.email || 'System',
    },
    { key: 'action', label: 'Action', render: (r) => r.action },
    { key: 'module', label: 'Module' },
    {
      key: 'summary',
      label: 'Summary',
      render: (r) => r.summary,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="System activity trail" />

      <div className="card grid gap-4 sm:grid-cols-2">
        <label className="label">
          Module
          <select className="input" value={module} onChange={(e) => setModule(e.target.value)}>
            <option value="">All modules</option>
            {['appointments', 'billing', 'settings', 'users'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Search
          <input
            type="search"
            className="input"
            placeholder="Summary or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <QueryState isLoading={logs.isLoading} isError={logs.isError} error={logs.error} onRetry={() => logs.refetch()}>
        <DataTable columns={columns} rows={logRows} emptyMessage="No audit entries found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </QueryState>
    </div>
  );
}

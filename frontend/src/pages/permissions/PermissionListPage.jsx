import QueryState from '../../components/common/QueryState';
import PageHeader from '../../components/common/PageHeader';
import { usePermissions } from '../../hooks/useRoles';

export default function PermissionListPage() {
  const permissions = usePermissions();

  const grouped = (permissions.data || []).reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Permissions" subtitle="Permission catalog grouped by module" />
      <QueryState
        isLoading={permissions.isLoading}
        isError={permissions.isError}
        error={permissions.error}
        onRetry={() => permissions.refetch()}
      >
        <div className="space-y-6">
          {Object.entries(grouped).map(([module, perms]) => (
            <section key={module} className="card">
              <h3 className="mb-4 text-lg font-semibold capitalize text-clinic-heading">{module}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-clinic-subtle">
                      <th className="pb-2 pr-4">Codename</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {perms.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 pr-4 font-mono text-clinic-700">{p.codename}</td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 capitalize text-clinic-subtle">{p.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

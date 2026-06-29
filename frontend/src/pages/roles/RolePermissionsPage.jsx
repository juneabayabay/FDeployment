import { useParams, Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import {
  useAssignPermission,
  usePermissions,
  useRemovePermission,
  useRole,
  useRolePermissions,
} from '../../hooks/useRoles';
import { parseApiError } from '../../utils/formatters';

export default function RolePermissionsPage() {
  const { id } = useParams();
  const { path } = useStaffPaths();
  const roleQuery = useRole(id);
  const permissionsQuery = usePermissions();
  const rolePermissionsQuery = useRolePermissions({ role: id });

  const assignMutation = useAssignPermission();
  const removeMutation = useRemovePermission();

  const role = roleQuery.data;
  const allPermissions = permissionsQuery.data || [];
  const rolePermissions = rolePermissionsQuery.data || [];

  const assignedIds = new Set(rolePermissions.map((rp) => rp.permission?.id || rp.permission_id));
  const available = allPermissions.filter((p) => !assignedIds.has(p.id));

  const grouped = allPermissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const isLoading = roleQuery.isLoading || permissionsQuery.isLoading || rolePermissionsQuery.isLoading;
  const isError = roleQuery.isError || permissionsQuery.isError || rolePermissionsQuery.isError;
  const error = roleQuery.error || permissionsQuery.error || rolePermissionsQuery.error;

  const handleRetry = () => {
    roleQuery.refetch();
    permissionsQuery.refetch();
    rolePermissionsQuery.refetch();
  };

  const handleAssign = (permissionId) => {
    assignMutation.mutate({ role: Number(id), permission_id: permissionId });
  };

  const handleRemove = (rpId) => {
    removeMutation.mutate(rpId);
  };

  const mutationError = assignMutation.error || removeMutation.error;

  return (
    <div>
      <PageHeader
        title={role ? `${role.name} — Permissions` : 'Role permissions'}
        subtitle={role?.description}
        actions={<Link to={path('/roles')} className="btn-ghost">← Back to roles</Link>}
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={handleRetry}
        isEmpty={!role && !isLoading}
        emptyTitle="Role not found."
      >
        {role && (
          <>
            <ErrorMessage message={mutationError ? parseApiError(mutationError) : ''} />

            <section className="card mb-6">
              <h3 className="mb-4 font-semibold text-clinic-heading">Assigned permissions ({rolePermissions.length})</h3>
              {rolePermissions.length === 0 ? (
                <p className="text-sm text-clinic-subtle">No permissions assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {rolePermissions.map((rp) => (
                    <li
                      key={rp.id}
                      className="flex flex-col gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0 break-words">
                        {rp.permission?.codename || rp.permission?.name}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost btn-sm shrink-0 self-start text-red-600 sm:self-auto"
                        onClick={() => handleRemove(rp.id)}
                        disabled={removeMutation.isPending}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h3 className="mb-4 font-semibold text-clinic-heading">Add permission</h3>
              {available.length === 0 ? (
                <p className="text-sm text-clinic-subtle">All permissions are already assigned.</p>
              ) : (
                Object.entries(grouped).map(([module, perms]) => (
                  <div key={module} className="mb-4">
                    <h4 className="mb-2 text-sm font-medium uppercase text-clinic-subtle">{module}</h4>
                    <ul className="space-y-1">
                      {perms.filter((p) => !assignedIds.has(p.id)).map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-col gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="min-w-0 break-words">
                            {p.codename} — {p.name}
                          </span>
                          <button
                            type="button"
                            className="btn-outline btn-sm shrink-0 self-start sm:self-auto"
                            onClick={() => handleAssign(p.id)}
                            disabled={assignMutation.isPending}
                          >
                            Assign
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </QueryState>
    </div>
  );
}

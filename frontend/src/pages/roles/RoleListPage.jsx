import QueryState from '../../components/common/QueryState';
import PageHeader from '../../components/common/PageHeader';
import RoleCard from '../../components/roles/RoleCard';
import { useRoles } from '../../hooks/useRoles';

export default function RoleListPage() {
  const roles = useRoles();

  return (
    <div>
      <PageHeader title="Roles" subtitle="Clinic roles and access levels" />
      <QueryState
        isLoading={roles.isLoading}
        isError={roles.isError}
        error={roles.error}
        onRetry={() => roles.refetch()}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(roles.data || []).map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}

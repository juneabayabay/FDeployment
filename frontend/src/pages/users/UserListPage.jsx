import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import UserTable from '../../components/users/UserTable';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { useUsers } from '../../hooks/useUsers';
import { parsePaginated } from '../../utils/pagination';

export default function UserListPage() {
  const [page, setPage] = useState(1);
  const { can } = usePermission();
  const { path } = useStaffPaths();
  const users = useUsers({ page });
  const { results, totalPages } = parsePaginated(users.data);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage clinic staff and accounts"
        actions={
          can('users.create') ? (
            <div className="flex flex-wrap gap-2">
              <Link to={path('/users/create-staff?role=dentist')} className="btn-outline">
                + Create Dentist
              </Link>
              <Link to={path('/users/create-staff?role=receptionist')} className="btn-primary">
                + Create Receptionist
              </Link>
            </div>
          ) : null
        }
      />
      <QueryState
        isLoading={users.isLoading}
        isError={users.isError}
        error={users.error}
        onRetry={() => users.refetch()}
      >
        <UserTable
          users={results}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </QueryState>
    </div>
  );
}

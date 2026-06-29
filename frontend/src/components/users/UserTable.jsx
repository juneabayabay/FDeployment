import { Link } from 'react-router-dom';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import { useStaffPaths } from '../../hooks/useStaffPaths';

export default function UserTable({ users, page, totalPages, onPageChange }) {
  const { path } = useStaffPaths();

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <Link to={path(`/users/${row.id}`)} className="font-medium text-clinic-500 hover:text-clinic-700">
          {row.full_name || `${row.first_name} ${row.last_name}`}
        </Link>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'roles',
      label: 'Roles',
      render: (row) => row.role_slugs?.join(', ') || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable columns={columns} rows={users} emptyMessage="No users found." />
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { useStaffPaths } from '../../hooks/useStaffPaths';

export default function RoleCard({ role }) {
  const { can } = usePermission();
  const { path } = useStaffPaths();

  return (
    <article className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
          <p className="text-sm text-slate-500">{role.slug}</p>
        </div>
        {role.is_system_role && (
          <span className="badge bg-slate-100 text-slate-600">System</span>
        )}
      </div>
      {role.description && <p className="mt-2 text-sm text-slate-600">{role.description}</p>}
      <p className="mt-3 text-sm text-slate-500">
        {role.permissions?.length || 0} permission(s)
      </p>
      {can('permissions.manage') && (
        <Link
          to={path(`/roles/${role.id}/permissions`)}
          className="mt-4 inline-block text-sm text-sky-600 hover:text-sky-800"
        >
          Manage permissions →
        </Link>
      )}
    </article>
  );
}

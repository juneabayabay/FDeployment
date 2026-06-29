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
          <h3 className="text-lg font-semibold text-clinic-heading">{role.name}</h3>
          <p className="text-sm text-clinic-subtle">{role.slug}</p>
        </div>
        {role.is_system_role && (
          <span className="badge bg-slate-100 text-clinic-body">System</span>
        )}
      </div>
      {role.description && <p className="mt-2 text-sm text-clinic-body">{role.description}</p>}
      <p className="mt-3 text-sm text-clinic-subtle">
        {role.permissions?.length || 0} permission(s)
      </p>
      {can('permissions.manage') && (
        <Link
          to={path(`/roles/${role.id}/permissions`)}
          className="mt-4 inline-block text-sm text-clinic-500 hover:text-clinic-700"
        >
          Manage permissions →
        </Link>
      )}
    </article>
  );
}

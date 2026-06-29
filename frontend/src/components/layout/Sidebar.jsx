import { NavLink } from 'react-router-dom';
import { APP_NAME, getNavItemsForPrefix, getPortalLabel } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { userHasRoleAccess } from '../../utils/auth';

export default function Sidebar({ basePath = '', mobileOpen = false, onClose }) {
  const { user } = useAuth();
  const { can } = usePermission();
  const navItems = getNavItemsForPrefix(basePath);

  const visibleItems = navItems
    .filter((item) => {
      if (item.role && !userHasRoleAccess(user, item.role)) return false;
      if (item.permission && !can(item.permission)) return false;
      return true;
    })
    .map((item) => ({
      ...item,
      path: `${basePath}${item.path}`,
    }));

  const asideClass = [
    'flex w-64 flex-col border-r border-clinic-100 bg-white',
    'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0',
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
  ].join(' ');

  return (
    <aside className={asideClass}>
      <div className="border-b border-clinic-100 px-6 py-5">
        <div className="text-lg font-bold text-clinic-heading">{APP_NAME}</div>
        <div className="text-caption mt-0.5 font-medium uppercase tracking-wide">{getPortalLabel(basePath)}</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('/dashboard')}
            onClick={onClose}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-clinic-50 font-semibold text-clinic-700'
                  : 'text-clinic-body hover:bg-clinic-50 hover:text-clinic-heading'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { APP_NAME, getNavItemsForPrefix, getPortalLabel } from '../../utils/constants';
import { usePermission } from '../../hooks/usePermission';

export default function Sidebar({ basePath = '', mobileOpen = false, onClose }) {
  const { can, hasRole } = usePermission();
  const navItems = getNavItemsForPrefix(basePath);

  const visibleItems = navItems
    .filter((item) => {
      if (item.role && !hasRole(item.role)) return false;
      if (item.permission && !can(item.permission)) return false;
      return true;
    })
    .map((item) => ({
      ...item,
      path: `${basePath}${item.path}`,
    }));

  const asideClass = [
    'flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-white',
    'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0',
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
  ].join(' ');

  return (
    <aside className={asideClass}>
      <div className="border-b border-slate-700 px-6 py-5">
        <div className="text-lg font-semibold">{APP_NAME}</div>
        <div className="text-xs text-slate-400">{getPortalLabel(basePath)}</div>
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
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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

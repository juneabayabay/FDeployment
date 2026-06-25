import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { getLoginPortal, portalLoginPath } from '../../utils/storage';

export default function Header({ basePath = '', onMenuClick }) {
  const { user, logout } = useAuth();
  const { can } = usePermission();

  const handleLogout = async () => {
    const portal = getLoginPortal();
    await logout();
    window.location.href = portalLoginPath(portal) || '/';
  };

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 max-w-[9rem] sm:max-w-xs md:max-w-none">
          <div className="truncate font-medium text-slate-900">{user?.full_name || user?.email}</div>
          <div className="hidden truncate text-xs capitalize text-slate-500 sm:block">
            {user?.role_slugs?.join(', ')}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <Link to={`${basePath}/profile`} className="text-sm text-sky-600 hover:text-sky-800">
          Profile
        </Link>
        {can('users.create') && (
          <Link
            to={`${basePath}/users/create-staff`}
            className="hidden text-sm text-sky-600 hover:text-sky-800 sm:inline"
          >
            Add Staff
          </Link>
        )}
        <button type="button" className="btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

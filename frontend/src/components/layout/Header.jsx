import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Avatar from '../common/Avatar';
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
    <header className="flex items-center justify-between gap-3 border-b border-clinic-100 bg-white px-4 py-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-clinic-muted hover:bg-clinic-50 md:hidden"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}
        <Avatar user={user} size="sm" className="hidden sm:block" />
        <div className="min-w-0 max-w-[9rem] sm:max-w-xs md:max-w-none">
          <div className="truncate font-semibold text-clinic-heading">{user?.full_name || user?.email}</div>
          <div className="text-caption hidden truncate capitalize sm:block">
            {user?.role_slugs?.join(', ')}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <Link to={`${basePath}/profile`} className="text-link text-sm">
          Profile
        </Link>
        {can('users.create') && (
          <Link
            to={`${basePath}/users/create-staff`}
            className="text-link hidden text-sm sm:inline"
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

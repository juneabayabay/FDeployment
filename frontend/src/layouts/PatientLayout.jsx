import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  FiBell,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiCreditCard,
  FiHome,
  FiMenu,
  FiPlusCircle,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  APP_NAME,
  PATIENT_BOTTOM_NAV,
  PATIENT_MORE_NAV,
  PATIENT_NAV_ITEMS,
} from '../utils/constants';
import { getLoginPortal, portalLoginPath } from '../utils/storage';

const NAV_ICONS = {
  home: FiHome,
  'calendar-plus': FiPlusCircle,
  calendar: FiCalendar,
  clipboard: FiClipboard,
  'credit-card': FiCreditCard,
  clock: FiClock,
  bell: FiBell,
  user: FiUser,
  menu: FiMenu,
};

function NavIcon({ name, className }) {
  const Icon = NAV_ICONS[name] || FiHome;
  return <Icon className={className} />;
}

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const [moreOpen, setMoreOpen] = useState(false);
  const online = useOnlineStatus();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = async () => {
    const portal = getLoginPortal();
    await logout();
    window.location.href = portalLoginPath(portal) || '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <strong className="text-lg text-slate-900">{APP_NAME}</strong>
            <span className="ml-2 hidden text-sm text-sky-600 sm:inline">Patient Portal</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/patient/notifications"
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <span className="hidden max-w-[120px] truncate text-sm text-slate-600 sm:inline">
              {user?.full_name || user?.email}
            </span>
            <button type="button" className="btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:flex">
          {PATIENT_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-100 text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <NavIcon name={item.icon} className="h-4 w-4" />
              {item.label}
              {item.badge && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {!online && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          You are offline. Some features may be unavailable until connection is restored.
        </div>
      )}

      <main className="mx-auto max-w-6xl p-4 pb-24 md:pb-6 md:p-6">
        <Outlet />
      </main>

      <nav className="nav-bottom">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-2">
          {PATIENT_BOTTOM_NAV.map((item) => {
            if (item.path === 'more') {
              return (
                <button
                  key="more"
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className="flex flex-1 flex-col items-center gap-0.5 px-1 py-1 text-xs text-slate-600"
                >
                  <FiMenu className="h-5 w-5" />
                  <span>More</span>
                </button>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 px-1 py-1 text-xs ${
                    isActive ? 'font-semibold text-sky-600' : 'text-slate-600'
                  }`
                }
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">More</h3>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setMoreOpen(false)}>
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PATIENT_MORE_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <NavIcon name={item.icon} className="h-5 w-5 text-sky-600" />
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

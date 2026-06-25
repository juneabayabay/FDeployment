import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiClipboard,
  FiClock,
  FiCreditCard,
  FiHome,
  FiUser,
} from 'react-icons/fi';

const ICONS = {
  book: FiCalendar,
  calendar: FiCalendar,
  clipboard: FiClipboard,
  clock: FiClock,
  user: FiUser,
  home: FiHome,
  billing: FiCreditCard,
};

export default function QuickActionGrid({ actions }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = ICONS[action.icon] || FiHome;
        return (
          <Link key={action.path} to={action.path} className="quick-action">
            <Icon className="h-6 w-6 text-sky-600" />
            <span className="text-sm font-medium text-slate-800">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

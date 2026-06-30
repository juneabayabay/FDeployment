import { Link, NavLink } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaSignInAlt,
  FaTooth,
  FaUserPlus,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const bookPath = isAuthenticated ? '/patient/book' : '/login';

  return (
    <header className="public-site-header">
      <div className="public-container public-header-inner">
        <Link to="/" className="public-logo">
          <div className="public-logo-icon">
            <FaTooth aria-hidden />
          </div>
          <div className="public-logo-text">
            Barnabas <span>Dental</span>
          </div>
        </Link>
        <nav className="public-nav-links">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/about#services" className={navClass}>
            Services
          </NavLink>
          <NavLink to={bookPath} className="public-btn public-btn-primary public-btn-sm">
            <FaCalendarCheck aria-hidden />
            Book
          </NavLink>
          <NavLink to="/register" className="public-btn public-btn-outline public-btn-sm">
            <FaUserPlus aria-hidden />
            Register
          </NavLink>
          <NavLink to="/login" className="public-btn public-btn-outline public-btn-sm">
            <FaSignInAlt aria-hidden />
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

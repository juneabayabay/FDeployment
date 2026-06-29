import { Link, NavLink } from 'react-router-dom';
import { FaTooth } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const bookPath = isAuthenticated ? '/patient/book' : '/login';

  return (
    <header className="public-header">
      <Link to="/" className="public-logo-area">
        <div className="public-logo-icon">
          <FaTooth aria-hidden />
        </div>
        <div className="public-logo-text">
          Barnabas <span>Dental</span>
        </div>
      </Link>
      <nav className="public-nav-links">
        <NavLink to="/login" className={navClass}>
          Login
        </NavLink>
        <NavLink to="/register" className={navClass}>
          Register
        </NavLink>
        <NavLink to="/about" className={navClass}>
          About
        </NavLink>
        <NavLink to={bookPath} className={({ isActive }) => `public-nav-primary ${isActive ? 'active' : ''}`}>
          Book Appointment
        </NavLink>
      </nav>
    </header>
  );
}

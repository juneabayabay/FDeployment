import { Link } from 'react-router-dom';
import {
  FaBullhorn,
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock,
  FaRocket,
  FaSignInAlt,
  FaStar,
  FaUserPlus,
  FaUtensils,
} from 'react-icons/fa';
import { CLINIC_ANNOUNCEMENTS, CLINIC_HOURS } from '../../config/publicContent';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const bookPath = isAuthenticated ? '/patient/book' : '/login';

  return (
    <>
      <section className="public-welcome">
        <div className="public-welcome-badge">
          <FaStar aria-hidden style={{ marginRight: 6 }} />
          Welcome
        </div>
        <h1>
          Barnabas <span>Dental Clinic</span>
        </h1>
        <p className="tagline">
          Quality dental care with convenient online booking, appointment tracking, and secure
          patient records – all in one place.
        </p>
        <div className="public-action-row">
          <Link to={bookPath} className="public-btn public-btn-primary">
            <FaCalendarCheck aria-hidden />
            Book Appointment
          </Link>
          <Link to="/register" className="public-btn public-btn-outline">
            <FaUserPlus aria-hidden />
            Register
          </Link>
          <Link to="/login" className="public-btn public-btn-outline">
            <FaSignInAlt aria-hidden />
            Login
          </Link>
        </div>
      </section>

      <div className="public-grid-2">
        <div className="public-card">
          <div className="public-card-title">
            <FaClock aria-hidden />
            Clinic Hours
          </div>
          <div className="public-hours-list">
            <div className="public-hours-item">
              <span className="label">
                <FaCalendarAlt aria-hidden />
                Days
              </span>
              <span className="value">{CLINIC_HOURS.days}</span>
            </div>
            <div className="public-hours-item">
              <span className="label">
                <FaClock aria-hidden />
                Hours
              </span>
              <span className="value highlight">
                {CLINIC_HOURS.open} – {CLINIC_HOURS.close}
              </span>
            </div>
            <div className="public-hours-item">
              <span className="label">
                <FaUtensils aria-hidden />
                Lunch break
              </span>
              <span className="value">
                <span className="public-lunch-badge">{CLINIC_HOURS.lunch}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="public-card">
          <div className="public-card-title">
            <FaRocket aria-hidden />
            Get started
          </div>
          <p className="public-get-started-text">
            New patients can register online in minutes. Returning patients can log in to book
            visits and view their records.
          </p>
          <div className="public-btn-group">
            <Link to="/register" className="public-btn public-btn-primary public-btn-sm">
              <FaUserPlus aria-hidden />
              Create account
            </Link>
            <Link to="/login" className="public-btn public-btn-outline public-btn-sm">
              <FaSignInAlt aria-hidden />
              Patient login
            </Link>
          </div>
        </div>
      </div>

      <section className="public-announcements">
        <div className="public-card" style={{ paddingBottom: '1.2rem' }}>
          <div className="public-card-title">
            <FaBullhorn aria-hidden />
            Announcements
          </div>
          {CLINIC_ANNOUNCEMENTS.map((item) => (
            <div key={item.id} className="public-announcement-item">
              <div className="info">
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
              <span className="date">
                <FaCalendarAlt aria-hidden />
                {formatDate(item.date)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

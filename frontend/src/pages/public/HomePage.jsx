import { Link } from 'react-router-dom';
import {
  FaAddressCard,
  FaBullhorn,
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock,
  FaEnvelope,
  FaInfoCircle,
  FaMapPin,
  FaPhoneAlt,
  FaSignInAlt,
  FaTooth,
  FaUndoAlt,
  FaUserMd,
  FaUserPlus,
} from 'react-icons/fa';
import {
  CLINIC_ANNOUNCEMENTS,
  CLINIC_CONTACT,
  CLINIC_HOURS,
} from '../../config/publicContent';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const bookPath = isAuthenticated ? '/patient/book' : '/login';

  return (
    <>
      <section className="public-hero">
        <div className="public-container public-hero-grid">
          <div className="public-hero-content">
            <span className="public-hero-badge">Welcome</span>
            <h1>Barnabas Dental Clinic</h1>
            <p>
              Quality dental care with convenient online booking, appointment tracking, and secure
              patient records – all in one place.
            </p>
            <div className="public-hero-buttons">
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
          </div>

          <div className="public-hero-contact">
            <div className="public-contact-title">
              <FaAddressCard aria-hidden style={{ marginRight: 8 }} />
              Contact &amp; Location
            </div>
            <div className="public-contact-item">
              <FaMapPin aria-hidden />
              <span className="public-contact-text">
                {CLINIC_CONTACT.addressLine1}
                <br />
                {CLINIC_CONTACT.addressLine2}
              </span>
            </div>
            <div className="public-contact-item">
              <FaPhoneAlt aria-hidden />
              <a href={`tel:${CLINIC_CONTACT.phone}`} className="public-contact-text">
                {CLINIC_CONTACT.phoneDisplay}
              </a>
            </div>
            <div className="public-contact-item">
              <FaEnvelope aria-hidden />
              <a href={`mailto:${CLINIC_CONTACT.email}`} className="public-contact-text">
                {CLINIC_CONTACT.email}
              </a>
            </div>
            <div className="public-hero-hours-note">
              <FaClock aria-hidden />
              <span>
                {CLINIC_HOURS.days} &middot; {CLINIC_HOURS.open} – {CLINIC_HOURS.close} &nbsp;|&nbsp;
                Lunch {CLINIC_HOURS.lunch}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="public-container public-main-content">
        <div className="public-cards-grid">
          <div className="public-feature-card">
            <div className="public-feature-icon">
              <FaUserMd aria-hidden />
            </div>
            <h3>Get started</h3>
            <p>
              New patients can register online in minutes. Returning patients can log in to book
              visits and view their records.
            </p>
            <Link to="/register" className="public-btn public-btn-primary public-btn-block">
              <FaUserPlus aria-hidden />
              Create account
            </Link>
          </div>

          <div className="public-feature-card">
            <div className="public-feature-icon">
              <FaUndoAlt aria-hidden />
            </div>
            <h3>Patient login</h3>
            <p>
              Access your appointments, view your schedule, and manage billing online — all from your
              secure portal.
            </p>
            <Link to="/login" className="public-btn public-btn-outline public-btn-block">
              <FaSignInAlt aria-hidden />
              Patient login
            </Link>
          </div>

          <div className="public-feature-card">
            <div className="public-feature-icon">
              <FaClock aria-hidden />
            </div>
            <h3>Clinic hours</h3>
            <p>
              We are open Monday through Saturday, 9 AM to 6 PM. Lunch break is 12–1 PM — no
              appointments during this time.
            </p>
            <a href="#clinic-hours" className="public-btn public-btn-outline public-btn-block">
              <FaInfoCircle aria-hidden />
              View schedule
            </a>
          </div>
        </div>

        <div className="public-section-divider">
          <span className="public-section-line" />
          <FaTooth aria-hidden />
          <span className="public-section-line" />
        </div>

        <div className="public-info-section">
          <div className="public-info-card" id="clinic-hours">
            <div className="public-section-label">
              <FaClock aria-hidden style={{ marginRight: 4 }} />
              Schedule
            </div>
            <h3>
              <FaClock aria-hidden />
              Clinic Hours
            </h3>

            <table className="public-hours-table">
              <tbody>
                <tr>
                  <td className="public-hours-day">Monday – Friday</td>
                  <td className="public-hours-time">
                    {CLINIC_HOURS.open} – {CLINIC_HOURS.close}
                  </td>
                </tr>
                <tr>
                  <td className="public-hours-day">Saturday</td>
                  <td className="public-hours-time">
                    {CLINIC_HOURS.open} – {CLINIC_HOURS.close}
                  </td>
                </tr>
                <tr className="public-hours-lunch">
                  <td className="public-hours-day">— Lunch break</td>
                  <td className="public-hours-time">{CLINIC_HOURS.lunch}</td>
                </tr>
                <tr>
                  <td className="public-hours-day">Sunday</td>
                  <td className="public-hours-time public-hours-closed">Closed</td>
                </tr>
              </tbody>
            </table>

            <div className="public-hours-note-small">
              <FaInfoCircle aria-hidden />
              <span>No appointments during lunch break.</span>
            </div>
          </div>

          <div className="public-info-card">
            <div className="public-section-label">
              <FaBullhorn aria-hidden style={{ marginRight: 4 }} />
              Updates
            </div>
            <h3>
              <FaBullhorn aria-hidden />
              Announcements
            </h3>

            {CLINIC_ANNOUNCEMENTS.map((item) => (
              <div key={item.id} className="public-announce-item">
                <div className="public-announce-date">
                  <FaCalendarAlt aria-hidden />
                  {formatDate(item.date)}
                </div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
